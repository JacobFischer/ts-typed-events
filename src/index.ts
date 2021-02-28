/**
 * This is a very simple strongly typed event emitter class, see README.md
 * for more details.
 */

/**
 * A simple container for all event listeners.
 *
 * @internal
 */
interface Listener<T> {
  /** Indicates if they should be removed after one emit. */
  once: boolean;

  /** The callback to invoke. */
  callback: (args: T) => void;

  /** The promise that will be resolved when the event is triggered. */
  promise?: Promise<T>;
}

/** Checks if a type extends undefined, without a discriminator. */
type HasUndefined<T, C = [T extends undefined ? true : false]> = C extends [
  true,
]
  ? true
  : C extends [false]
  ? false
  : true;

/** An emitter function for a ts-typed-events Event. */
type BaseEmitterFunc<T = undefined> = HasUndefined<T> extends true
  ? Exclude<T, undefined> extends never
    ? () => boolean
    : (emitting?: T) => boolean
  : (emitting: T) => boolean;

/**
 * A ts-typed-events event to register callbacks on to be invoked when they are
 * emitted.
 */
export abstract class BaseEvent<T = undefined> {
  /** All the current listeners for this event. */
  private listeners: Array<Listener<T>> = [];

  /**
   * Marked as protected to discourage creation outside of
   * createEventEmitter().
   */
  protected constructor() {
    // pass
  }

  /**
   * Attaches a callback to trigger on all emits for this event.
   *
   * @param callback - The callback to invoke on all emits.
   */
  public on(callback: (data: T) => void): void {
    this.listeners.push({
      once: false,
      callback,
    });
  }

  /**
   * Attaches a callback to trigger on only the first emit for this event.
   * After that event is emitted this callback will automatically be
   * removed.
   *
   * @param callback - The callback to invoke only the next time this event
   * emits, then that callback is removed from this event.
   */
  public once(callback: (emitted: T) => void): void;

  /**
   * Attaches a callback to trigger on only the first emit for this event.
   *
   * Returns a promise that resolves with the emitted data the next time this
   * event is triggered (only once).
   *
   * @returns A promise that resolves with the emitted data the next time this
   * event is triggered (only once).
   */
  public once(): Promise<T>;

  /**
   * Attaches a callback to trigger on only the first emit for this event.
   *
   * This version either takes a callback or returns a promise.
   *
   * @param callback - Optional callback, if specified invokes the callback
   * only once when the event is triggered, then removes it.
   * Otherwise returns a promise that resolves with the value the next time
   * this event is triggered.
   * @returns Nothing if a callback is passed, otherwise a Promise that
   * should resolve once this Event emits.
   */
  public once(callback?: (emitted: T) => void): void | Promise<T> {
    if (!callback) {
      // then they want us to return the promise
      const promise = new Promise<T>((resolve) => {
        // this will invoke the version that has a callback,
        // so resolve can be used as the callback
        this.once(resolve);
      });
      // attach the promise we just made to the listener (it was pushed
      // on the end via this.once() above)
      this.listeners[this.listeners.length - 1].promise = promise;
      return promise;
    }

    // else we were sent a normal callback, so attach it
    this.listeners.push({
      once: true,
      callback,
    });
  }

  /**
   * Removes a callback from this event (regardless of once vs on).
   *
   * Returns true if a callback was removed, false otherwise.
   *
   * @param listener - The callback to remove.
   * @returns True if a callback was removed, false otherwise.
   */
  public off(listener: ((emitted: T) => void) | Promise<T>): boolean {
    const originalLength = this.listeners.length;
    // remove all listeners that have the same callback as this one
    this.listeners = this.listeners.filter((l) => {
      return listener !== l.callback && (!l.promise || listener !== l.promise);
    });

    return this.listeners.length !== originalLength;
  }

  /**
   * Removes ALL callbacks from this event, regardless of once vs on.
   *
   * Returns the number of listeners removed.
   *
   * @returns The number of listeners removed.
   */
  public offAll(): number {
    const originalLength = this.listeners.length;
    this.listeners.length = 0; // empty our listener array
    return originalLength;
  }
}

/**
 * A ts-typed-events event to register callbacks on to be invoked when they are
 * emitted.
 *
 * This Event class signifies the event is "sealed" from the outside and cannot
 * be emitted through itself. The emitter function is separated.
 */
export class SealedEvent<T = undefined> extends BaseEvent<T> {
  // functionally identical to BaseEvent, just a different name to better
  // signify its difference from the old `Event`.
}

/** An emitter function with itself and its event as properties keyed on it. */
export type Emitter<T, TEvent extends BaseEvent<T>> = BaseEmitterFunc<T> & {
  /** The Event this emitter emits to. */
  readonly event: TEvent;
  /** A cyclical reference to the same emitter function. */
  readonly emit: Emitter<T, TEvent>;
};

/** @internal */
function createEmitterWithBaseEvent<T, TEvent extends BaseEvent<T>>(
  event: TEvent,
): Emitter<T, TEvent> {
  // Hack-y, we are reaching into to grab the listeners
  // realistically, this would be a friend style function
  const publicListenersEvent = (event as unknown) as {
    listeners: Array<Listener<T>>;
  };
  /**
   * The emitter function for the event.
   *
   * @param emitting - Whatever is being emitted.
   * @returns True if any listeners were emitted to, false otherwise.
   */
  function emit(emitting?: T) {
    const { listeners } = publicListenersEvent;
    const hadListeners = listeners.length > 0;
    for (const listener of listeners) {
      listener.callback(emitting as T);
    }

    // remove all listeners that only wanted to listen once
    publicListenersEvent.listeners = listeners.filter(({ once }) => !once);
    return hadListeners;
  }

  // Hack: Need to find a better way to convince TS this function will have
  // the correct keys on these circular functions.
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
  const func = emit as any;
  func.event = event;
  func.emit = emit;
  const emitter = func as Emitter<T, TEvent>;
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */

  return emitter;
}

/**
 * Creates and returns an emitter for a SealedEvent, with the event keyed off
 * the emitter via `.event`.
 *
 * @returns An emitter function that will emit to the `.event` SealedEvent.
 */
export function createEmitter<T = undefined>(): Emitter<T, SealedEvent<T>> {
  // This is a hack-y way to create a new class instance that doesn't want you
  // to.
  const EventClass = (SealedEvent as unknown) as {
    new (): SealedEvent<T>;
  };
  return createEmitterWithBaseEvent(new EventClass());
}

/**
 * A specialized Event that holds a reference to its own emit function.
 * This allows any code with access to the Event to also trigger emits.
 */
export class Event<T = undefined> extends BaseEvent<T> {
  /**
   * Emits a value to all the listeners, triggering their callbacks.
   * Returns true if the event had listeners emitted to,
   * false otherwise.
   * Because this exists on the event, any code with access to this event
   * can trigger the callback for all listeners.
   *
   * @param emitting - If the Event has a type, this is the data of that type
   * to emit to all listeners. If no type (undefined) this argument should
   * be omitted.
   * @returns True if the event had listeners emitted to, false otherwise.
   */
  public emit = createEmitterWithBaseEvent<T, Event<T>>(this);

  /**
   * Creates a new Event, with its emit accessible as a member function.
   */
  public constructor() {
    super();
  }
}

/**
 * Creates and returns an emitter for an Event, with the event keyed off
 * the emitter via `.event`.
 * **Note**: The `event` here is will have a member function `.emit` that emits
 * to the same function as the emitter returned here.
 *
 * @returns An emitter function that will emit to the `.event` Event.
 */
export function createEventEmitter<T = undefined>(): Emitter<T, Event<T>> {
  return createEmitterWithBaseEvent(new Event());
}
