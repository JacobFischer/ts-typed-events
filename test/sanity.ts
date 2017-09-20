import { expect } from "chai";

describe("Sanity", () => {
    it("should be sane", async () => {
        expect(true).is.true;
        expect(false).is.false;
    });
    it("should not be insane", async () => {
        expect(true).is.not.false;
        expect(false).is.not.true;
    });
});
