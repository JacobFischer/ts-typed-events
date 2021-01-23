/**
 * This is a very simple strongly typed event emitter class, see README.md
 * for more details.
 */

/** A simple container for all event listeners. */
interface Listener<T> {
    /** Indicates if they should be removed after one emit. */
    once: boolean;

    /** The callback to invoke. */
    callback: (args: T) => void;

    /** The promise that will be resolved when the event is triggered. */
    promise?: Promise<T>;
}

type HasUndefined<T, C = [T extends undefined ? true : false]> = C extends [
    true,
]
    ? true
    : C extends [false]
    ? false
    : true;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Emitter<T = undefined> = HasUndefined<T> extends true
    ? Exclude<T, undefined> extends never
        ? () => boolean
        : (emitting?: T) => boolean
    : (emitting: T) => boolean;

export class Event<T = undefined> {
    /** All the current listeners for this event. */
    private listeners: Array<Listener<T>> = [];

    /**
     * Attaches a listener to trigger on all emits for this event.
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
     * Attaches a listener to trigger on only the first emit for this event.
     * After that event is emitted this callback will automatically be
     * removed.
     *
     * @param callback - The callback to invoke only the next time this event
     * emits, then that callback is removed from this event.
     */
    public once(callback: (emitted: T) => void): void;

    /**
     * Attaches a listener to trigger on only the first emit for this event.
     *
     * Returns a promise that resolves with the data the next time this event
     * is triggered (only once).
     *
     * @returns A promise that resolves with the data the next time this event
     * is triggered (only once).
     */
    public once(): Promise<T>;

    /**
     * Attaches a listener to trigger on only the first emit for this event.
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
     * Removes a callback from the listeners on this event, regardless of once
     * vs on.
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
            return (
                listener !== l.callback &&
                (!l.promise || listener !== l.promise)
            );
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
 * Creates an emitter for an Event.
 *
 * @internal
 * @param event - The event to create an emitter for.
 * @returns A new emitter function for the given event.
 */
function createEmitter<T>(event: Event<T>): Emitter<T> {
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

    return emit as Emitter<T>;
}

/**
 * Bundles up an Event instance with an emitter for it, in the expected tuple
 * return type for creator functions.
 *
 * @internal
 * @param event - The event to wrap the Event in.
 * @returns A special Array tuple with the [event, emit] and keyed off those
 * names.
 */
function tupleEventAndEmitter<TEvent extends Event<T>, T>(
    event: TEvent,
): EventAndEmitter<T, TEvent> {
    const emit = createEmitter(event);
    const eventAndEmit = [event, emit] as [TEvent, Emitter<T>] & {
        event: TEvent;
        emit: Emitter<T>;
    };

    eventAndEmit.emit = emit;
    eventAndEmit.event = event;

    return eventAndEmit;
}

/**
 * A tuple of both [event, emit] and {event, emit},
 * for you to consume however you desire.
 * The emitter for this event will only exist returned here, seperate from the
 * event.
 */
export type EventAndEmitter<T, TEvent extends Event<T>> = readonly [
    event: TEvent,
    emitter: Emitter<T>,
] & {
    event: TEvent;
    emit: Emitter<T>;
};

/**
 * Creates and returns a new Event and the emitter for that Event.
 *
 * @returns A tuple of the [event, emit] both keyed as an array and object.
 */
export function createEventAndEmit<T = undefined>(): EventAndEmitter<
    T,
    Event<T>
> {
    return tupleEventAndEmitter(new Event<T>());
}

/**
 * A specialized Event that holds a reference to its own emit function.
 * This allows any code with access to the Event to also trigger emits.
 */
export class PublicEvent<T> extends Event<T> {
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
    public emit = createEmitter(this);
}

/**
 * A tuple of both [event, emit] and {event, emit},
 * for you to consume however you desire.
 * The emitter can be considered optional, as the PublicEvent returned can self
 * emit. However this is exposed for API parody with the non Public version.
 *
 * @returns A tuple of the [event, emit] both keyed as an array and object.
 */
export function createPublicEventAndEmitter<T = undefined>(): EventAndEmitter<
    T,
    PublicEvent<T>
> {
    return tupleEventAndEmitter(new PublicEvent<T>());
}
