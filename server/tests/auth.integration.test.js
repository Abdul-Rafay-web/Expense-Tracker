const request = require("supertest");
const app = require("../src/app");
const { prisma, resetDatabase } = require("./helpers/db");
const { signUpAgent } = require("./helpers/auth");

beforeEach(async () => {
    await resetDatabase();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Sign up", () => {
    it("creates the account, sets a secure session cookie and starter categories", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({ name: "Ayesha Khan", email: "Ayesha@Example.com", password: "password123" });

        expect(res.status).toBe(201);
        expect(res.body.user).toMatchObject({ name: "Ayesha Khan", email: "ayesha@example.com" });
        expect(res.body.user).not.toHaveProperty("passwordHash");

        const cookie = res.headers["set-cookie"][0];
        expect(cookie).toMatch(/^em_session=/);
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/SameSite=Lax/);

        const stored = await prisma.user.findUnique({ where: { email: "ayesha@example.com" } });
        expect(stored.passwordHash).not.toContain("password123");

        const categories = await request(app).get("/api/categories").set("Cookie", cookie);
        expect(categories.status).toBe(200);
        expect(categories.body.length).toBe(8);
    });

    it("rejects an email that is already registered, ignoring letter case", async () => {
        await signUpAgent(app, { email: "test@example.com" });

        const res = await request(app)
            .post("/api/auth/signup")
            .send({ name: "Someone", email: "TEST@example.com", password: "password123" });

        expect(res.status).toBe(409);
        expect(res.body.details[0]).toMatchObject({ field: "email" });
    });

    it("rejects a short password and an invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({ name: "Someone", email: "not-an-email", password: "short" });

        expect(res.status).toBe(400);
        expect(res.body.details.map((detail) => detail.field).sort()).toEqual(["email", "password"]);
    });
});

describe("Log in and log out", () => {
    it("logs in with the right password and returns the user from /me", async () => {
        await signUpAgent(app, { name: "Bilal", email: "bilal@example.com", password: "correct-horse" });
        const agent = request.agent(app);

        const login = await agent.post("/api/auth/login").send({ email: "BILAL@example.com", password: "correct-horse" });
        expect(login.status).toBe(200);

        const me = await agent.get("/api/auth/me");
        expect(me.status).toBe(200);
        expect(me.body.user).toMatchObject({ name: "Bilal", email: "bilal@example.com" });
    });

    it("gives the same error for a wrong password and an unknown email", async () => {
        await signUpAgent(app, { email: "bilal@example.com", password: "correct-horse" });

        const wrongPassword = await request(app).post("/api/auth/login").send({ email: "bilal@example.com", password: "wrong-password" });
        const unknownEmail = await request(app).post("/api/auth/login").send({ email: "nobody@example.com", password: "correct-horse" });

        expect(wrongPassword.status).toBe(401);
        expect(unknownEmail.status).toBe(401);
        expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
    });

    it("ends the session on logout", async () => {
        const agent = await signUpAgent(app);

        const logout = await agent.post("/api/auth/logout");
        expect(logout.status).toBe(204);

        const me = await agent.get("/api/auth/me");
        expect(me.status).toBe(401);
        expect(await prisma.session.count()).toBe(0);
    });

    it("rejects an expired session", async () => {
        const agent = await signUpAgent(app);
        await prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });

        const me = await agent.get("/api/auth/me");

        expect(me.status).toBe(401);
    });
});

describe("Protected data", () => {
    it("requires a session for every data endpoint", async () => {
        const paths = ["/api/categories", "/api/transactions", "/api/budgets?month=2026-09", "/api/analytics/summary?month=2026-09"];

        for (const path of paths) {
            const res = await request(app).get(path);
            expect(res.status).toBe(401);
        }
    });

    it("keeps each user's money private", async () => {
        const ayesha = await signUpAgent(app, { name: "Ayesha", email: "ayesha@example.com" });
        const bilal = await signUpAgent(app, { name: "Bilal", email: "bilal@example.com" });

        const ayeshaCategories = await ayesha.get("/api/categories");
        const food = ayeshaCategories.body.find((category) => category.name === "Food");
        const created = await ayesha
            .post("/api/transactions")
            .send({ type: "EXPENSE", amount: 50000, date: "2026-09-10", categoryId: food.id });

        const bilalList = await bilal.get("/api/transactions");
        expect(bilalList.body).toHaveLength(0);

        const bilalSummary = await bilal.get("/api/analytics/summary?month=2026-09");
        expect(bilalSummary.body.totalExpenses).toBe(0);

        const bilalDelete = await bilal.delete(`/api/transactions/${created.body.id}`);
        expect(bilalDelete.status).toBe(404);

        const bilalEdit = await bilal.patch(`/api/transactions/${created.body.id}`).send({ amount: 1 });
        expect(bilalEdit.status).toBe(404);

        const bilalUsesAyeshaCategory = await bilal
            .post("/api/transactions")
            .send({ type: "EXPENSE", amount: 100, date: "2026-09-10", categoryId: food.id });
        expect(bilalUsesAyeshaCategory.status).toBe(404);

        const bilalBudget = await bilal.put("/api/budgets").send({ categoryId: food.id, month: "2026-09", limitAmount: 1000 });
        expect(bilalBudget.status).toBe(404);

        const ayeshaList = await ayesha.get("/api/transactions");
        expect(ayeshaList.body).toHaveLength(1);
        expect(ayeshaList.body[0].amount).toBe(50000);
    });

    it("lets two users each have a category with the same name", async () => {
        const ayesha = await signUpAgent(app, { email: "ayesha@example.com" });
        const bilal = await signUpAgent(app, { email: "bilal@example.com" });

        const first = await ayesha.post("/api/categories").send({ name: "Gym" });
        const second = await bilal.post("/api/categories").send({ name: "Gym" });

        expect(first.status).toBe(201);
        expect(second.status).toBe(201);
    });
});
