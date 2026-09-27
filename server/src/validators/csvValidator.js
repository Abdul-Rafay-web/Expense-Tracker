const { z } = require("zod");

function isRealDate(value) {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const csvRowSchema = z.object({
    date: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must look like 2026-09-15")
        .refine(isRealDate, "Date is not a real calendar date")
        .transform((value) => new Date(value)),
    type: z.string().trim().toUpperCase().pipe(z.enum(["INCOME", "EXPENSE"])),
    category: z.string().trim().min(1, "Category is required").max(50, "Category name is too long"),
    amount: z
        .string()
        .trim()
        .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a number like 1500 or 1500.50")
        .transform((value) => Math.round(Number(value) * 100))
        .refine((paisa) => paisa > 0, "Amount must be greater than 0"),
    note: z
        .string()
        .trim()
        .max(200, "Note is too long")
        .optional()
        .transform((value) => value || undefined),
});

module.exports = { csvRowSchema };
