const request = require("supertest");
const app = require("../src/app");
const { prisma, resetDatabase } = require("./helpers/db");

beforeEach(async () => {
    await resetDatabase();
});

afterAll(async () => {
    await prisma.$disconnect();
});

async function createCategory(name) {
    const res = await request(app).post("/api/categories").send({ name });
    return res.body;
}

async function createExpense(categoryId, amount, date) {
    const res = await request(app).post("/api/transactions").send({ type: "EXPENSE", amount, date, categoryId });
    return res.body;
}

describe("Categories API", () => {
    it("creates a category and lists it", async () => {
        const createRes = await request(app).post("/api/categories").send({ name: "Food" });

        expect(createRes.status).toBe(201);
        expect(createRes.body).toMatchObject({ name: "Food" });

        const listRes = await request(app).get("/api/categories");

        expect(listRes.status).toBe(200);
        expect(listRes.body).toHaveLength(1);
    });

    it("rejects a duplicate name with 409", async () => {
        await createCategory("Food");

        const res = await request(app).post("/api/categories").send({ name: "Food" });

        expect(res.status).toBe(409);
    });
});

describe("Transactions API", () => {
    it("filters transactions by month", async () => {
        const food = await createCategory("Food");
        await createExpense(food.id, 50000, "2026-09-10");
        await createExpense(food.id, 30000, "2026-08-10");

        const res = await request(app).get("/api/transactions?month=2026-09");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ amount: 50000, category: { name: "Food" } });
    });

    it("rejects a negative amount with 400", async () => {
        const food = await createCategory("Food");

        const res = await request(app)
            .post("/api/transactions")
            .send({ type: "EXPENSE", amount: -500, date: "2026-09-10", categoryId: food.id });

        expect(res.status).toBe(400);
    });

    it("deletes a transaction", async () => {
        const food = await createCategory("Food");
        const transaction = await createExpense(food.id, 50000, "2026-09-10");

        const res = await request(app).delete(`/api/transactions/${transaction.id}`);

        expect(res.status).toBe(204);
        const listRes = await request(app).get("/api/transactions");
        expect(listRes.body).toHaveLength(0);
    });
});

describe("Budgets API", () => {
    it("reports WARNING when 85% of the budget is spent", async () => {
        const food = await createCategory("Food");
        await request(app)
            .put("/api/budgets")
            .send({ categoryId: food.id, month: "2026-09", limitAmount: 100000 });
        await createExpense(food.id, 85000, "2026-09-10");

        const res = await request(app).get("/api/budgets?month=2026-09");

        expect(res.status).toBe(200);
        expect(res.body[0]).toMatchObject({ spent: 85000, percentUsed: 85, status: "WARNING" });
    });
});

describe("Analytics API", () => {
    it("returns the monthly summary", async () => {
        const food = await createCategory("Food");
        const salary = await createCategory("Salary");
        await createExpense(food.id, 40000, "2026-09-10");
        await request(app)
            .post("/api/transactions")
            .send({ type: "INCOME", amount: 100000, date: "2026-09-01", categoryId: salary.id });

        const res = await request(app).get("/api/analytics/summary?month=2026-09");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ month: "2026-09", totalIncome: 100000, totalExpenses: 40000, balance: 60000 });
    }); describe("Update transaction API", () => {
        it("updates only the fields that are sent", async () => {
            const food = await createCategory("Food");
            const transaction = await createExpense(food.id, 50000, "2026-09-10");

            const res = await request(app)
                .patch(`/api/transactions/${transaction.id}`)
                .send({ amount: 75000, note: "Dinner with friends" });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                id: transaction.id,
                amount: 75000,
                note: "Dinner with friends",
                type: "EXPENSE",
                category: { name: "Food" },
            });
        });

        it("returns 404 for a transaction that does not exist", async () => {
            const res = await request(app).patch("/api/transactions/999").send({ amount: 100 });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });

        it("returns 404 when moving to a category that does not exist", async () => {
            const food = await createCategory("Food");
            const transaction = await createExpense(food.id, 50000, "2026-09-10");

            const res = await request(app)
                .patch(`/api/transactions/${transaction.id}`)
                .send({ categoryId: 999 });

            expect(res.status).toBe(404);
        });

        it("returns 400 when the body is empty", async () => {
            const food = await createCategory("Food");
            const transaction = await createExpense(food.id, 50000, "2026-09-10");

            const res = await request(app).patch(`/api/transactions/${transaction.id}`).send({});

            expect(res.status).toBe(400);
        });
    });
});