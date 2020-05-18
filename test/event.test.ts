import { Event } from "../src/";

describe("Event", () => {
    it("should exist", () => {
        expect(Event).toBeTruthy();
    });

    it("should construct", () => {
        expect(new Event()).toBeInstanceOf(Event);
    });

    it("should add listeners", () => {
        const event = new Event();
        expect(event.on(() => true)).toBeUndefined();
    });

    it("should emit to listeners", () => {
        const VAL = Symbol("emitTest");
        const event = new Event<typeof VAL>();
        const fn = jest.fn((arg) => {
            expect(arg).toBe(VAL);
        });
        event.on(fn);
        expect(event.emit(VAL)).toBe(true);
        expect(fn).toBeCalled();
    });

    it("should return false with listeners", () => {
        const event = new Event();
        expect(event.emit()).toBe(false);
    });

    it("should emit the correct type", () => {
        const stringValue = "Some string to test with";
        const event = new Event<string>();
        event.on((arg) => {
            expect(arg).toEqual(stringValue);
            expect(typeof arg).toEqual("string");
        });
        expect(event.emit(stringValue)).toEqual(true);
    });

    it("should emit multiple times with on", () => {
        let i = 0;
        const event = new Event<number>();

        const TIMES = 20;
        let emits = 0;
        event.on((arg) => {
            emits++;
            expect(typeof arg).toEqual("number");
            expect(arg).toEqual(i);
        });

        for (i = 0; i < TIMES; i++) {
            expect(event.emit(i)).toEqual(true);
        }

        expect(emits).toEqual(TIMES);
    });

    it("should only emit once via once", () => {
        let i = 0;
        const event = new Event<number>();

        const TIMES = 20;
        let emits = 0;
        event.once((arg) => {
            emits++;
            expect(arg).toEqual(i);
            expect(typeof arg).toEqual("number");
        });

        for (i = 0; i < TIMES; i++) {
            const returned = event.emit(i);
            if (i === 0) {
                expect(returned).toEqual(true);
            } else {
                // the listener should be removed, and thus it should return false for no listeners
                expect(returned).toEqual(false);
            }
        }

        expect(emits).toEqual(1);
    });

    it("should only returns a promise with once", () => {
        const event = new Event();
        expect(event.once()).toBeInstanceOf(Promise);
    });

    it("should emit to callbacks once", async () => {
        const VAL = Symbol("onceTest");
        const event = new Event<symbol>();

        setImmediate(() => {
            event.emit(VAL);
        }, 10);

        expect(await event.once()).toEqual(VAL);
    });

    it("should be able to remove a listener", () => {
        const NUM = 1337;
        const event = new Event<number>();
        const callback = () => {
            expect(NUM).toEqual(NUM);
        };

        event.on(callback);
        expect(event.emit(NUM)).toEqual(true);

        expect(event.off(callback)).toEqual(true);

        // now there should be no one to emit to
        expect(event.emit(NUM)).toEqual(false);
    });

    it("should be able to remove a listener promise", () => {
        const NUM = 1337;
        const event = new Event<number>();
        const promise = event.once();
        expect(promise).toBeInstanceOf(Promise);

        const callback = jest.fn();
        promise.then(callback);
        expect(callback).not.toBeCalled();

        expect(event.off(promise)).toEqual(true);

        // now there should be no one to emit to
        expect(event.emit(NUM)).toEqual(false);
    });

    it("should tell when no listener is removed", () => {
        const event = new Event<true>();

        expect(event.off(() => null)).toEqual(false);
    });

    it("should remove all listeners", () => {
        const LISTENERS = 8;
        const event = new Event<true>();

        for (let i = 0; i < LISTENERS; i++) {
            event.on(() => true);
        }

        expect(event.offAll()).toEqual(LISTENERS);
    });

    it("should allow events with no generic type (signals)", () => {
        const signal = new Event();

        signal.on((arg) => {
            expect(arg).toBeUndefined();
        });

        expect(signal.emit()).toEqual(true); // emit with no data because this is a signal
    });
});
