import { Event } from "../src/";

describe("Event class", () => {
    it("should not allow TS constructor or emit", () => {
        // @ts-expect-error constructor should not be exposed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const event: Event = new Event();

        // @ts-expect-error emit should not be exposed;
        expect(event.emit).toBeUndefined();
    });
});
