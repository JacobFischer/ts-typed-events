import { Event, PublicEvent } from "../src/";

describe("PublicEvent class", () => {
    it("should be able to be constructed", () => {
        expect(() => new PublicEvent()).not.toThrow();
    });

    it("should be an Event", () => {
        const publicEvent = new PublicEvent();
        expect(publicEvent).toBeInstanceOf(Event);
    });

    it("should have an emit member function", () => {
        const publicEvent = new PublicEvent();
        expect(publicEvent.emit).toBeTruthy();
        expect(typeof publicEvent.emit).toBe("function");
    });

    it("should be able to emit via the event", () => {
        const testing = Symbol("test string");
        const publicEvent = new PublicEvent<symbol>();
        const callback = jest.fn((emitted) => {
            expect(emitted).toBe(testing);
        });

        publicEvent.on(callback);
        publicEvent.emit(testing);

        expect(callback).toBeCalled();
    });
});
