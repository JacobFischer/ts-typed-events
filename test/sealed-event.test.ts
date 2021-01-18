import { Emitter, Event, SealedEvent } from "../src/";

describe("SealedEvent", () => {
    it("should construct", () => {
        const {
            event,
            emit,
        }: { event: SealedEvent; emit: Emitter } = Event.createSealed();
        expect(event).toBeInstanceOf(Event);
        expect(typeof emit).toBe("function");
    });

    it("should emit to listeners", () => {
        const VAL = Symbol("emitTest");
        const { event, emit } = Event.createSealed<typeof VAL>();
        const fn = jest.fn((arg) => {
            expect(arg).toBe(VAL);
        });
        event.on(fn);
        expect(emit(VAL)).toBe(true);
        expect(fn).toBeCalled();
    });
});
