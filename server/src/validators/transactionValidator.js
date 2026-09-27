const { z } = require("zod");
const { monthSchema } = require("./commonValidator");
const { BASE_CURRENCY, CURRENCY_CODES } = require("../utils/currency");

const transactionFields = {
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.number().int().positive(),
    currency: z.enum(CURRENCY_CODES),
    date: z.coerce.date(),
    note: z.string().trim().max(200).optional(),
    categoryId: z.number().int().positive(),
};

const createTransactionSchema = z.object({
    ...transactionFields,
    currency: transactionFields.currency.default(BASE_CURRENCY),
});

const updateTransactionSchema = z
    .object(transactionFields)
    .partial()
    .refine((data) => Object.keys(data).length > 0, "Send at least one field to update");

const listTransactionsQuerySchema = z.object({
    month: monthSchema.optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
});

module.exports = { createTransactionSchema, listTransactionsQuerySchema, updateTransactionSchema };
