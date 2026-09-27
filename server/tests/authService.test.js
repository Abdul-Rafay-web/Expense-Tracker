jest.mock("../src/repositories/userRepository");
jest.mock("../src/repositories/sessionRepository");

const userRepository = require("../src/repositories/userRepository");
const sessionRepository = require("../src/repositories/sessionRepository");
const authService = require("../src/services/authService");
const { hashPassword, hashSessionToken } = require("../src/utils/security");
const { DEMO_EMAIL } = require("../src/utils/demo");

const storedUser = { id: 7, name: "Ayesha Khan", email: "ayesha@example.com", createdAt: new Date("2026-09-27T10:00:00Z") };

beforeEach(() => {
    jest.resetAllMocks();
    sessionRepository.create.mockResolvedValue({});
});

describe("signup", () => {
    it("rejects an email that is already registered", async () => {
        userRepository.findByEmail.mockResolvedValue(storedUser);

        const failure = await authService.signup({ name: "A", email: storedUser.email, password: "password123" }).catch((e) => e);

        expect(failure).toMatchObject({ statusCode: 409 });
        expect(failure.details[0].field).toBe("email");
        expect(userRepository.createWithCategories).not.toHaveBeenCalled();
    });

    it("stores a hash instead of the password, adds starter categories and starts a session", async () => {
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.createWithCategories.mockImplementation(async (data) => ({ ...storedUser, ...data }));

        const result = await authService.signup({ name: "Ayesha Khan", email: storedUser.email, password: "password123" });

        const [data, categories] = userRepository.createWithCategories.mock.calls[0];
        expect(data.passwordHash).not.toContain("password123");
        expect(categories).toEqual(authService.DEFAULT_CATEGORIES);
        expect(result.user).toEqual({ id: 7, name: "Ayesha Khan", email: storedUser.email, createdAt: storedUser.createdAt });
        expect(result.user).not.toHaveProperty("passwordHash");
        expect(sessionRepository.create.mock.calls[0][0].tokenHash).toBe(hashSessionToken(result.token));
    });
});

describe("login", () => {
    it("gives the same 401 for an unknown email and a wrong password", async () => {
        userRepository.findByEmail.mockResolvedValueOnce(null);
        const unknown = await authService.login({ email: "nobody@example.com", password: "x" }).catch((e) => e);

        userRepository.findByEmail.mockResolvedValueOnce({ ...storedUser, passwordHash: await hashPassword("right-password") });
        const wrong = await authService.login({ email: storedUser.email, password: "wrong-password" }).catch((e) => e);

        expect(unknown).toMatchObject({ statusCode: 401 });
        expect(wrong).toMatchObject({ statusCode: 401 });
        expect(unknown.message).toBe(wrong.message);
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("clears expired sessions and starts a new one for the right password", async () => {
        userRepository.findByEmail.mockResolvedValue({ ...storedUser, passwordHash: await hashPassword("right-password") });

        const result = await authService.login({ email: storedUser.email, password: "right-password" });

        expect(sessionRepository.removeExpired).toHaveBeenCalledWith(7);
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
        expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
});

describe("authenticate", () => {
    it("returns null without a token or for an unknown token", async () => {
        expect(await authService.authenticate(undefined)).toBeNull();

        sessionRepository.findByTokenHash.mockResolvedValue(null);
        expect(await authService.authenticate("unknown-token")).toBeNull();
    });

    it("deletes an expired session and returns null", async () => {
        sessionRepository.findByTokenHash.mockResolvedValue({ expiresAt: new Date(Date.now() - 1000), user: storedUser });

        expect(await authService.authenticate("old-token")).toBeNull();
        expect(sessionRepository.removeByTokenHash).toHaveBeenCalledWith(hashSessionToken("old-token"));
    });

    it("returns the public user for a valid session", async () => {
        sessionRepository.findByTokenHash.mockResolvedValue({ expiresAt: new Date(Date.now() + 60000), user: { ...storedUser, passwordHash: "secret" } });

        const user = await authService.authenticate("good-token");

        expect(user).toEqual({ id: 7, name: "Ayesha Khan", email: storedUser.email, createdAt: storedUser.createdAt });
    });
});

describe("loginDemo", () => {
    it("explains how to create the demo account when it is missing", async () => {
        userRepository.findByEmail.mockResolvedValue(null);

        await expect(authService.loginDemo()).rejects.toMatchObject({ statusCode: 404 });
        expect(userRepository.findByEmail).toHaveBeenCalledWith(DEMO_EMAIL);
    });

    it("starts a session for the demo account without a password", async () => {
        userRepository.findByEmail.mockResolvedValue({ ...storedUser, email: DEMO_EMAIL });

        const result = await authService.loginDemo();

        expect(result.user.email).toBe(DEMO_EMAIL);
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
    });
});
