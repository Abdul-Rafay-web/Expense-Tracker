const categoryRepository = require("../repositories/categoryRepository")
const { AppError } = require("../errors");
async function listCategories(name) {
    return categoryRepository.findAll();
}
async function createCategory(name) {
    const existing = await categoryRepository.findByName(name)
    if (existing) {
        throw new AppError(409, `Category ${name} already exists`)
    }
    return categoryRepository.create({ name });
}

async function deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new AppError(404, "Category not found");
    }

    const usage = await categoryRepository.countTransactions(id);
    if (usage > 0) {
        throw new AppError(409, `Category is used by ${usage} transaction(s) and cannot be deleted`);
    }

    await categoryRepository.remove(id);
}

module.exports = { listCategories, createCategory, deleteCategory }