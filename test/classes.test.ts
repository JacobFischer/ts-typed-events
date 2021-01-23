import { Event, PublicEvent } from "../src/";

const classes = [Event, PublicEvent] as Array<typeof Event>;

classes.forEach((Class) =>
    describe(`class ${Class.name}`, () => {
        it("should exist", () => {
            expect(Class).toBeTruthy();
            expect(typeof Class).toBe("function");
        });

        it("should construct", () => {
            const event = new Class();
            expect(event).toBeInstanceOf(Event);
            expect(event).toBeInstanceOf(Class);
        });

        it("should be the correct shape", () => {
            const event = new Class();
            expect(typeof event.off).toBe("function");
        });

        it("should add listeners", () => {
            const event = new Class();
            expect(event.on(() => true)).toBeUndefined();
        });
    }),
);

describe("PublicEvent differences", () => {
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
