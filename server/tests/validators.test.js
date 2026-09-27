const { csvRowSchema } = require("../src/validators/csvValidator");
const { createTransactionSchema, updateTransactionSchema } = require("../src/validators/transactionValidator");
const { signupSchema } = require("../src/validators/authValidator");
const { trendQuerySchema } = require("../src/validators/analyticsValidator");
const { idParamSchema } = require("../src/validators/commonValidator");

describe("csvRowSchema", () => {
    it("cleans and converts a valid row", () => {
        const row = csvRowSchema.parse({ date: "2026-09-15", type: " expense ", category: " Food ", amount: "19.99", note: "" });

        expect(row.type).toBe("EXPENSE");
        expect(row.category).toBe("Food");
        expect(row.amount).toBe(1999);
        expect(row.date.toISOString()).toBe("2026-09-15T00:00:00.000Z");
        expect(row.note).toBeUndefined();
    });

    it("rejects dates that do not exist or use another format", () => {
        expect(csvRowSchema.safeParse({ date: "2026-02-31", type: "EXPENSE", category: "Food", amount: "5" }).success).toBe(false);
        expect(csvRowSchema.safeParse({ date: "15/09/2026", type: "EXPENSE", category: "Food", amount: "5" }).success).toBe(false);
    });

    it("rejects negative, zero, comma-formatted and over-precise amounts", () => {
        for (const amount of ["-20", "0", "1,500", "12.345"]) {
            expect(csvRowSchema.safeParse({ date: "2026-09-15", type: "EXPENSE", category: "Food", amount }).success).toBe(false);
        }
    });

    it("rejects an unknown type and a blank category", () => {
        expect(csvRowSchema.safeParse({ date: "2026-09-15", type: "SPENDING", category: "Food", amount: "5" }).success).toBe(false);
        expect(csvRowSchema.safeParse({ date: "2026-09-15", type: "INCOME", category: "   ", amount: "5" }).success).toBe(false);
    });
});

describe("transaction schemas", () => {
    it("accepts whole paisa and converts the date text", () => {
        const data = createTransactionSchema.parse({ type: "INCOME", amount: 150000, date: "2026-09-01", categoryId: 1 });

        expect(data.date).toBeInstanceOf(Date);
    });

    it("rejects fractional or text amounts", () => {
        expect(createTransactionSchema.safeParse({ type: "EXPENSE", amount: 12.5, date: "2026-09-01", categoryId: 1 }).success).toBe(false);
        expect(createTransactionSchema.safeParse({ type: "EXPENSE", amount: "500", date: "2026-09-01", categoryId: 1 }).success).toBe(false);
    });

    it("requires at least one field when updating", () => {
        const empty = updateTransactionSchema.safeParse({});

        expect(empty.success).toBe(false);
        expect(empty.error.issues[0].message).toBe("Send at least one field to update");
        expect(updateTransactionSchema.safeParse({ note: "Dinner" }).success).toBe(true);
        expect(updateTransactionSchema.safeParse({ amount: -1 }).success).toBe(false);
    });
});

describe("signupSchema", () => {
    it("trims and lower-cases the email", () => {
        const data = signupSchema.parse({ name: " Ayesha ", email: "  Ayesha@Example.COM ", password: "password123" });

        expect(data.email).toBe("ayesha@example.com");
        expect(data.name).toBe("Ayesha");
    });

    it("rejects a short password, a bad email and an empty name", () => {
        const result = signupSchema.safeParse({ name: "", email: "not-an-email", password: "short" });
        const fields = result.error.issues.map((issue) => issue.path[0]).sort();

        expect(fields).toEqual(["email", "name", "password"]);
    });
});

describe("query and parameter schemas", () => {
    it("rejects a trend range that runs backwards", () => {
        expect(trendQuerySchema.safeParse({ from: "2026-09", to: "2026-07" }).success).toBe(false);
        expect(trendQuerySchema.safeParse({ from: "2026-09", to: "2026-09" }).success).toBe(true);
    });

    it("turns a numeric id from the URL into a number and rejects anything else", () => {
        expect(idParamSchema.parse({ id: "5" })).toEqual({ id: 5 });
        expect(idParamSchema.safeParse({ id: "abc" }).success).toBe(false);
        expect(idParamSchema.safeParse({ id: "-3" }).success).toBe(false);
    });
});
