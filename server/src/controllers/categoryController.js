const categoryService = require("../services/categoryServices")
const { createCategorySchema, idParamSchema } = require("../validators/categoryValidators")

async function list(req, res) {
    const categories = await categoryService.listCategories();
    res.json(categories)
}

async function create(req, res) {
    const { name } = createCategorySchema.parse(req.body)
    const category = await categoryService.createCategory(name);
    res.status(201).json(category);
}

async function remove(req, res) {
    const { id } = idParamSchema.parse(req.params)
    await categoryService.deleteCategory(id)
    res.status(204).end()
}
module.exports = { list, create, remove }