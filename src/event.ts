/** This is a very simple strongly typed event emitter class, see README.md for more details */

/** A simple container for all event listeners */
interface IListener<T> {
    /** Indicates if they should be removed after one emit */
    once: boolean;

    /** The callback to invoke */
    callback: (args: T) => void;

    /** The promise that will be resolved when the event is triggered */
    promise?: Promise<T>;
}

/** The basic interface for combined events */
export interface IEvents {
    /** lookup event by name */
    [eventName: string]: Event<any>;
}

/** A typed event, given a type will emit values of that type to listeners */
export class Event<T extends any = undefined> {
    /** All the current listeners for this event */
    private listeners: Array<IListener<T>> = [];

    /**
     * Attaches a listener to trigger on all emits for this event
     * @param callback the callback to invoke on all emits
     */
    public on(callback: (data: T) => any): void {
        this.listeners.push({
            once: false,
            callback,
        });
    }

    /**
     * Attaches a listener to trigger on only the first emit for this event.
     * After that event is emitted this callback will automatically be removed.
     * @param callback the callback to invoke only the next time this event
     * emits, then that callback is removed from this event
     */
    public once(callback: (arg: T) => any): void;

    /**
     * Attaches a listener to trigger on only the first emit for this event.
     *
     * Returns a promise that resolves with the arg the next time this event
     * is triggered (only once).
     * @returns a promise that resolves with the arg the next time this event
     * is triggered (only once)
     */
    public once(): Promise<T>;

    /**
     * Attaches a listener to trigger on only the first emit for this event.
     *
     * This version either takes a callback or returns a promise.
     * @param callback optional callback, if specified invokes the callback
     * only once when the event is triggered, then removes it.
     * Otherwise returns a promise that resolves with the value the next time
     * this event is triggered
     */
    public once(callback?: (arg: T) => any): void | Promise<T> {
        if (!callback) {
            // then they want us to return the promise
            const promise = new Promise<T>((resolve, reject) => {
                // this will invoke the version that has a callback, so resolve can be used as the callback
                this.once(resolve);
            });
            // attach the promise we just made to the listener (it was pushed on
            // the end via this.once() above)
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
     * Removes a callback from the listeners on this event, regardless of once vs on.
     *
     * Returns true if a callback was removed, false otherwise.
     * @param callback the callback to remove
     * @returns true if a callback was removed, false otherwise
     */
    public off(listener: ((arg: T) => any) | Promise<T>): boolean {
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
     * @returns the number of listeners removed
     */
    public offAll(): number {
        const originalLength = this.listeners.length;
        this.listeners.length = 0;
        return originalLength;
    }

    /**
     * Emits a value to all the listeners, triggering their callbacks.
     *
     * Returns true if the event had listeners, false otherwise.
     * @param arg the argument to emit to all listeners as their argument.
     * @returns true if the event had listeners, false otherwise
     */
    public emit(arg: T): boolean {
        const hadListeners = this.listeners.length > 0;
        for (const listener of this.listeners) {
            listener.callback(arg);
        }

        // remove all listeners that only wanted to listen once
        this.listeners = this.listeners.filter((l) => !l.once);
        return hadListeners;
    }
}

/** A utility function that creates a grouping of events and can manipulate those events */
export interface IEventsFunction {
    /**
     * Creates a handy interface object of event names for combining linked events.
     *
     * Returns  a the group object now frozen for easy TS lookups.
     * @param group an object of events used to group the event by name
     * @returns a the group object now frozen for easy TS lookups
     */
    <T>(group: T): Readonly<T & IEvents>;

    /**
     * Combines two events objects into one, while creating a TS interface for type checking.
     *
     * Returns a new frozen object that is the two lists combined, with B taking precedent over A for conflicts.
     * @param eventsA the first object of events to combine with B
     * @param eventsB the second object of events to combine with A
     * @returns a new frozen object that is the two lists combined, with B taking precedent over A for conflicts
     */
    concat: <T extends IEvents, S extends IEvents>(eventsA: T, eventsB: S) => Readonly<T & S>;
}

/**
 * Creates a handy interface object of event names for combining linked events.
 *
 * Returns a frozen object of events for easy grouping.
 * @param group an object of events used to group the event by name
 * @returns a frozen object of events for easy grouping
 */
export const events: IEventsFunction = (function groupEvents<T>(group: T): Readonly<T> {
    return Object.freeze(group);
}) as any; // any because it lacks the contact function below,
           // and there is no easy way in TS to hook that up right now

/**
 * Combines two events objects into one, while creating a TS interface for type checking.
 *
 * Returns a frozen object that is the two lists combined, with B taking precedent over A for conflicts
 * @param eventsA the first object of events to combine with B
 * @param eventsB the second object of events to combine with A
 * @returns a frozen object that is the two lists combined, with B taking precedent over A for conflicts
 */
events.concat = <T extends IEvents, S extends IEvents>(eventsA: T, eventsB: S): Readonly<T & S> => {
    return Object.freeze(Object.assign({}, eventsA, eventsB)) as any;
};

/** old style exports for those using them */
module.exports = {Event, events};
