const { z } = require("zod");

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must look like 2026-09");

const summaryQuerySchema = z.object({
    month: monthSchema,
});

const breakdownQuerySchema = z.object({
    month: monthSchema,
    type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
});

module.exports = { summaryQuerySchema, breakdownQuerySchema };