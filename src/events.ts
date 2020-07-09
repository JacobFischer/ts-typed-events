import { Event } from "./event";

/** The basic interface for combined events. */
// TODO: change `{}` to `Record<string, unknown>` on next major version release
// eslint-disable-next-line @typescript-eslint/ban-types
export type Events<T extends {}> = {
    [K in keyof T]: T[K] extends Event<infer P> ? T[K] : never;
};

/**
 * A utility function that creates a grouping of events and can manipulate
 * those events.
 */
export interface EventsFunction {
    /**
     * Creates a handy interface object of event names for combining linked
     * events.
     *
     * Returns  a the group object now frozen for easy TS lookups.
     *
     * @param group - An object of events used to group the event by name.
     * @returns A the group object now frozen for easy TS lookups.
     */
    <T extends Events<T>>(group: T): Readonly<T>;

    /**
     * Combines two events objects into one, while creating a TS interface for
     * type checking.
     *
     * Returns a new frozen object that is the two lists combined, with B
     * taking precedent over A for conflicts.
     *
     * @param eventsA - The first object of events to combine with B.
     * @param eventsB - The second object of events to combine with A.
     * @returns A new frozen object that is the two lists combined, with B
     * taking precedent over A for conflicts.
     */
    concat: <T extends Events<T>, S extends Events<S>>(
        eventsA: T,
        eventsB: S,
    ) => Readonly<T & S>;

    /**
     * Removes all event listeners from all events.
     */
    offAll: <T extends Events<T>>(events: T) => void;
}

/**
 * Creates a handy interface object of event names for combining linked
 * events.
 *
 * Returns a frozen object of events for easy grouping.
 *
 * @param group - An object of events used to group the event by name.
 * @returns A frozen object of events for easy grouping.
 */
export const events: EventsFunction = function groupEvents<
    T extends Events<T>
>(group: T): Readonly<T> {
    return Object.freeze(group);
};

/**
 * Combines two events objects into one, while creating a TS interface for
 * type checking.
 *
 * Returns a frozen object that is the two lists combined, with B taking
 * precedent over A for conflicts.
 *
 * @param eventsA - The first object of events to combine with B.
 * @param eventsB - The second object of events to combine with A.
 * @returns A frozen object that is the two lists combined, with B taking
 * precedent over A for conflicts.
 */
events.concat = function eventsConcat<
    T extends Events<T>,
    S extends Events<S>
>(eventsA: T, eventsB: S): Readonly<T & S> {
    return Object.freeze({
        ...eventsA,
        ...eventsB,
    });
};

/**
 * Removes all event listeners from a group of events.
 *
 * @param events - An object of keys mapping to Event instances to remove all
 * the listeners from.
 */
events.offAll = function eventsOffAll<T extends Events<T>>(events: T): void {
    // Use for-in loop to preserve ES3 full backwards compatability.
    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const key in events) {
        // Because the else condition should never happen
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(events, key)) {
            const event = ((events as unknown) as { [k: string]: Event })[key];
            event.offAll(); // will exist because of above check
        }
    }
};
