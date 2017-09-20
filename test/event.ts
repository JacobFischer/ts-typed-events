import { expect } from "chai";
import { Event } from "../src/event";

describe("Event", () => {
    it("should exist", async () => {
        expect(Event).to.exist;
    });

    it("should construct", async () => {
        expect(new Event()).to.be.an.instanceOf(Event);
    });

    it("should add listeners", async () => {
        const event = new Event();
        expect(event.on(() => true)).to.not.throw;
    });

    it("should emit to listeners", async () => {
        const event = new Event<true>();
        event.on((arg) => {
            expect(arg).is.true;
        });
        expect(event.emit(true)).is.true;
    });

    it("should return false with listeners", async () => {
        const event = new Event();
        expect(event.emit(undefined)).is.false;
    });

    it("should emit the correct type", async () => {
        const stringValue = "Some string to test with";
        const event = new Event<string>();
        event.on((arg) => {
            expect(arg).is.equal(stringValue);
            expect(arg).to.be.a("string");
        });
        expect(event.emit(stringValue)).is.true;
    });

    it("should should emit multiple times with on", async () => {
        let i = 0;
        const event = new Event<number>();

        const TIMES = 20;
        let emits = 0;
        event.on((arg) => {
            emits++;
            expect(arg).is.equal(i);
            expect(arg).to.be.a("number");
        });

        for (i = 0; i < TIMES; i++) {
            expect(event.emit(i)).is.true;
        }

        expect(emits).to.equal(TIMES);
    });

    it("should should only emit once via once", async () => {
        let i = 0;
        const event = new Event<number>();

        const TIMES = 20;
        let emits = 0;
        event.once((arg) => {
            emits++;
            expect(arg).is.equal(i);
            expect(arg).to.be.a("number");
        });

        for (i = 0; i < TIMES; i++) {
            const returned = event.emit(i);
            if (i === 0) {
                expect(returned).is.true;
            }
            else {
                // the listener should be removed, and thus it should return false for no listeners
                expect(returned).is.false;
            }
        }

        expect(emits).to.equal(1);
    });

    it("should should only returns a promise with once", async () => {
        const event = new Event();
        expect(event.once()).to.be.an.instanceOf(Promise);
    });

    it("should with with async syntax", async () => {
        const event = new Event<null>();

        setImmediate(() => {
            event.emit(null);
        }, 10);

        expect(await event.once()).to.equal(null);
    });

    it("should be able to remove a listener", async () => {
        const NUM = 1337;
        const event = new Event<number>();
        const callback = (arg: number) => {
            expect(NUM).equals(NUM);
        };

        event.on(callback);
        expect(event.emit(NUM)).is.true;

        expect(event.off(callback)).is.true;

        // now there should be no one to emit to
        expect(event.emit(NUM)).is.false;
    });

    it("should tell when no listener is removed", async () => {
        const event = new Event<true>();

        expect(event.off(() => true)).to.be.false;
    });

    it("should remove all listeners", async () => {
        const LISTENERS = 8;
        const event = new Event<true>();

        for (let i = 0; i < LISTENERS; i++) {
            event.on(() => true);
        }

        expect(event.offAll()).to.equal(LISTENERS);
    });
});
