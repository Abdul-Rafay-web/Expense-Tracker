const { hashPassword, verifyPassword, createSessionToken, hashSessionToken } = require("../src/utils/security");

describe("password hashing", () => {
    it("never stores the plain password and verifies the right one", async () => {
        const hash = await hashPassword("my-secret-pass");

        expect(hash).not.toContain("my-secret-pass");
        expect(await verifyPassword("my-secret-pass", hash)).toBe(true);
        expect(await verifyPassword("wrong-pass", hash)).toBe(false);
    });

    it("gives the same password a different hash each time", async () => {
        const first = await hashPassword("same-password");
        const second = await hashPassword("same-password");

        expect(first).not.toBe(second);
    });

    it("rejects a malformed stored hash", async () => {
        expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
    });
});

describe("session tokens", () => {
    it("creates long random tokens and stores only their hash", () => {
        const token = createSessionToken();

        expect(token.length).toBeGreaterThanOrEqual(43);
        expect(createSessionToken()).not.toBe(token);
        expect(hashSessionToken(token)).toMatch(/^[a-f0-9]{64}$/);
        expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    });
});
