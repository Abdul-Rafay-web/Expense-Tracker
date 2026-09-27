const { z } = require("zod");

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must look like 2026-09");

const setBudgetSchema = z.object({
    categoryId: z.number().int().positive(),
    month: monthSchema,
    limitAmount: z.number().int().positive(),
});

const monthQuerySchema = z.object({
    month: monthSchema,
});

module.exports = { setBudgetSchema, monthQuerySchema };