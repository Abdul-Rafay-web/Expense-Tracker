const { z } = require("zod");

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must look like 2026-09");

const summaryQuerySchema = z.object({
    month: monthSchema,
});

const breakdownQuerySchema = z.object({
    month: monthSchema,
    type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
});

const trendQuerySchema = z
    .object({ from: monthSchema, to: monthSchema })
    .refine((data) => data.from <= data.to, "'from' must be the same as or before 'to'");

module.exports = { summaryQuerySchema, breakdownQuerySchema, trendQuerySchema };