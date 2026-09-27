const categoryRepository = require("../repositories/categoryRepository")
const { AppError } = require("../errors");
async function listCategories(userId) {
    return categoryRepository.findAll(userId);
}
async function createCategory(userId, name) {
    const existing = await categoryRepository.findByName(userId, name)
    if (existing) {
        throw new AppError(409, `Category ${name} already exists`)
    }
    return categoryRepository.create({ userId, name });
}

async function deleteCategory(userId, id) {
    const category = await categoryRepository.findById(userId, id);
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
