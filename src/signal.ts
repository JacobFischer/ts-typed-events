import { Event } from "./event";

/*
 * A version of the Event class that takes no data and emits no data.
 * It emitting is a signal alone.
 */
export class Signal extends Event<undefined> {
    /**
     * Emits the event as a signal that the event occurred (with no data).
     *
     * Returns true if the event had listeners, false otherwise.
     *
     * @returns True if the event had listeners, false otherwise.
     */
    public emit(): boolean {
        return super.emit(undefined);
    }
}
