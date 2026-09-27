const { z } = require("zod");
const { monthSchema } = require("./commonValidator");

const setBudgetSchema = z.object({
    categoryId: z.number().int().positive(),
    month: monthSchema,
    limitAmount: z.number().int().positive(),
});

const monthQuerySchema = z.object({
    month: monthSchema,
});

module.exports = { setBudgetSchema, monthQuerySchema };
