const { z } = require("zod");
const { monthSchema } = require("./commonValidator");

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
