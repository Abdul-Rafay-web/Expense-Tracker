const { z } = require("zod");

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must look like 2026-09");

const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

module.exports = { monthSchema, idParamSchema };
