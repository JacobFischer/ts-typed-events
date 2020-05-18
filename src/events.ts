import { Event } from "./event";

/** The basic interface for combined events. */
export interface Events {
    /** Lookup event by name. */
    [eventName: string]: Event | undefined;
}

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
    <T>(group: T): Readonly<T & Events>;

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
    concat: <T extends Events, S extends Events>(
        eventsA: T,
        eventsB: S,
    ) => Readonly<T & S>;

    /**
     * Removes all event listeners from all events.
     */
    offAll: <T extends Events>(events: T) => void;
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
export const events: EventsFunction = function groupEvents<T>(
    group: T,
): Readonly<T> {
    return Object.freeze(group);
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
// any because it lacks the functions below at this moment,
// so it does not properly implement the interface,
// and there is no easy way in TS to hook that up right now

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
events.concat = function eventsConcat<T extends Events, S extends Events>(
    eventsA: T,
    eventsB: S,
): Readonly<T & S> {
    return Object.freeze({
        ...(eventsA as object),
        ...(eventsB as object),
    }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * Removes all event listeners from a group of events.
 *
 * @param group - An object of keys mapping to Event instances to remove all
 * the listeners from.
 */
events.offAll = function eventsOffAll<T extends Events>(group: T): void {
    for (const key of Object.keys(group)) {
        const event = group[key];
        (event as Event).offAll(); // will exist because of Object.keys
    }
};
