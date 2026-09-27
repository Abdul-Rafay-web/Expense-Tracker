import { describe, expect, it } from "vitest";
import { convertedPreview, initialValues, toPayload, validateTransaction } from "./transactionForm";
import { formatOriginal } from "./format";

const valid = { type: "EXPENSE", amount: "100", currency: "USD", categoryId: "3", date: "2026-09-12", note: " Hosting " };

describe("validateTransaction", () => {
    it("accepts complete values", () => {
        expect(validateTransaction(valid)).toEqual({});
    });

    it("reports every invalid field at once", () => {
        const errors = validateTransaction({ ...valid, amount: "-5", categoryId: "", date: "", note: "x".repeat(201) });

        expect(Object.keys(errors).sort()).toEqual(["amount", "categoryId", "date", "note"]);
    });
});

describe("toPayload", () => {
    it("converts the amount to minor units and keeps the currency", () => {
        expect(toPayload(valid, true)).toEqual({ type: "EXPENSE", amount: 10000, currency: "USD", categoryId: 3, date: "2026-09-12", note: "Hosting" });
    });

    it("drops an empty note only for new transactions", () => {
        expect(toPayload({ ...valid, note: "  " }, true)).not.toHaveProperty("note");
        expect(toPayload({ ...valid, note: "  " }, false).note).toBe("");
    });
});

describe("initialValues", () => {
    it("edits a foreign-currency transaction in its original currency", () => {
        const values = initialValues({ type: "INCOME", amount: 2800000, originalAmount: 10000, currency: "USD", categoryId: 7, date: "2026-09-12T00:00:00.000Z", note: null }, "2026-09");

        expect(values).toMatchObject({ amount: "100", currency: "USD", categoryId: "7", date: "2026-09-12", note: "" });
    });

    it("starts new transactions in PKR", () => {
        expect(initialValues(null, "2025-01")).toMatchObject({ currency: "PKR", date: "2025-01-01", amount: "" });
    });
});

describe("currency display", () => {
    it("previews the PKR value of a foreign amount", () => {
        expect(convertedPreview(valid, [{ code: "USD", rate: 280 }])).toEqual({ amount: 2800000, rate: 280 });
        expect(convertedPreview({ ...valid, currency: "PKR" }, [])).toBeNull();
    });

    it("shows the original amount only for foreign currencies", () => {
        expect(formatOriginal({ currency: "USD", originalAmount: 10000 })).toBe("USD 100.00");
        expect(formatOriginal({ currency: "PKR", originalAmount: null })).toBe("");
    });
});
