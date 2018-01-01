import { expect } from "chai";
import { Event, events } from "../src";

describe("events", () => {
    it("should exist", async () => {
        expect(events).to.exist;
    });

    it("should be a function", async () => {
        expect(events).to.be.a("function");
    });

    it("should create an group of events", async () => {
        const group = events({
            alpha: new Event(),
            beta: new Event(),
            delta: new Event(),
        });

        expect(group).to.be.a("object");

        expect(group).to.have.property("alpha");
        expect(group.alpha).to.be.an.instanceOf(Event);

        expect(group).to.have.property("beta");
        expect(group.beta).to.be.an.instanceOf(Event);

        expect(group).to.have.property("delta");
        expect(group.delta).to.be.an.instanceOf(Event);
    });

    it("should have concat", async () => {
        expect(events).to.have.property("concat");
        expect(events.concat).to.be.a("function");
    });

    it("should concat groups", async () => {
        const groupA = events({
            alpha: new Event(),
            beta: new Event(),
        });

        const groupB = events({
            delta: new Event(),
            gamma: new Event(),
        });

        const combined = events.concat(groupA, groupB);

        expect(combined).to.be.a("object");

        expect(combined).to.have.property("alpha");
        expect(combined.alpha).to.be.an.instanceOf(Event);

        expect(combined).to.have.property("beta");
        expect(combined.beta).to.be.an.instanceOf(Event);

        expect(combined).to.have.property("delta");
        expect(combined.delta).to.be.an.instanceOf(Event);

        expect(combined).to.have.property("gamma");
        expect(combined.delta).to.be.an.instanceOf(Event);
    });

    it("should have offAll", async () => {
        expect(events).to.have.property("offAll");
        expect(events.offAll).to.be.a("function");
    });

    it("should be able to remove all listeners from a group of events", async () => {
        const group = events({
            alpha: new Event(),
            beta: new Event(),
        });

        let callbackHit = false;
        group.alpha.on(() => callbackHit = true);
        group.beta.on(() => callbackHit = true);

        events.offAll(group);

        expect(group.alpha.emit(undefined)).to.be.false;
        expect(callbackHit).to.be.false;

        expect(group.beta.emit(undefined)).to.be.false;
        expect(callbackHit).to.be.false;
    });
});
