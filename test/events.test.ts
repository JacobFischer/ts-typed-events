import { Event, events } from "../src";

describe("events", () => {
    it("should exist", () => {
        expect(events).toBeTruthy();
    });

    it("should be a function", () => {
        expect(typeof events).toEqual("function");
    });

    it("should create an group of events", () => {
        const group = events({
            alpha: new Event<string>(),
            beta: new Event<number>(),
            delta: new Event(),
        });

        expect(typeof group).toEqual("object");

        expect(group).toHaveProperty("alpha");
        expect(group.alpha).toBeInstanceOf(Event);

        expect(group).toHaveProperty("beta");
        expect(group.beta).toBeInstanceOf(Event);

        expect(group).toHaveProperty("delta");
        expect(group.delta).toBeInstanceOf(Event);
    });

    it("should emit seperately", () => {
        const group = events({
            first: new Event(),
            second: new Event(),
        });

        const firstCallback = jest.fn();
        group.first.on(firstCallback);
        const secondCallback = jest.fn();

        expect(group.first.emit()).toEqual(true);
        expect(firstCallback).toBeCalled();
        expect(secondCallback).not.toBeCalled();
    });

    it("should have concat", () => {
        expect(events).toHaveProperty("concat");
        expect(typeof events.concat).toEqual("function");
    });

    it("should concat groups", () => {
        const groupA = events({
            alpha: new Event(),
            beta: new Event(),
        });

        const groupB = events({
            delta: new Event(),
            gamma: new Event(),
        });

        const combined = events.concat(groupA, groupB);

        expect(typeof combined).toEqual("object");

        expect(combined).toHaveProperty("alpha");
        expect(combined.alpha).toBeInstanceOf(Event);

        expect(combined).toHaveProperty("beta");
        expect(combined.beta).toBeInstanceOf(Event);

        expect(combined).toHaveProperty("delta");
        expect(combined.delta).toBeInstanceOf(Event);

        expect(combined).toHaveProperty("gamma");
        expect(combined.delta).toBeInstanceOf(Event);
    });

    it("should have offAll", () => {
        expect(events).toHaveProperty("offAll");
        expect(typeof events.offAll).toEqual("function");
    });

    it("should be able to remove all listeners from a group of events", () => {
        const group = events({
            alpha: new Event(),
            beta: new Event(),
        });

        let callbackHit = false;
        group.alpha.on(() => (callbackHit = true));
        group.beta.on(() => (callbackHit = true));

        expect(events.offAll(group)).toBeUndefined();

        expect(group.alpha.emit()).toEqual(false);
        expect(callbackHit).toEqual(false);

        expect(group.beta.emit()).toEqual(false);
        expect(callbackHit).toEqual(false);
    });
});
