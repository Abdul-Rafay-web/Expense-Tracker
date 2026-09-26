const { z } = require("zod");
const createTransactionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.number().int().positive(),
    date: z.coerce.date(),
    note: z.string().trim().max(200).optional(),
    categoryId: z.number().int().positive(),
});
const listTransactionsQuerySchema = z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must look like 2026-09").optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
});

module.exports = { createTransactionSchema, listTransactionsQuerySchema };