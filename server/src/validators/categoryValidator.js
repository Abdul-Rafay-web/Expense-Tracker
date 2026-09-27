const z = require("zod")
const createCategorySchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(50, "Name is too long")
});
module.exports = { createCategorySchema };
