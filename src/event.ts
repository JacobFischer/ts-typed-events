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

    /**
     * Emits a value to all the listeners, triggering their callbacks.
     * Returns true if the event had listeners emitted to,
     * false otherwise.
     *
     * @param emitting - If the Event has a type, this is the data of that type
     * to emit to all listeners. If no type (never) this argument should
     * be omitted.
     * @returns True if the event had listeners emitted to, false otherwise.
     */
    public readonly emit: [T] extends [{}|null]
        ? (emitting: T) => boolean
        : () => boolean = ((
        emitting?: T,
    ) /* undefined only valid for singals */ => {
        const hadListeners = this.listeners.length > 0;
        for (const listener of this.listeners) {
            listener.callback(emitting as T);
        }

        // remove all listeners that only wanted to listen once
        this.listeners = this.listeners.filter((l) => !l.once);
        return hadListeners;
    }) as [T] extends [{}|null] ? (emitting: T) => boolean : () => boolean;
}
