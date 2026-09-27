const transactionRepository = require("../repositories/transactionRepository");
const categoryRepository = require("../repositories/categoryRepository");
const { AppError } = require("../errors");

function monthRange(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    const start = new Date(Date.UTC(year, monthNumber - 1, 1));
    const end = new Date(Date.UTC(year, monthNumber, 1));
    return { start, end };
}

async function listTransactions({ month, type }) {
    const range = month ? monthRange(month) : {};
    return transactionRepository.findMany({ type, ...range });

}

async function createTransaction(data) {
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
        throw new AppError(404, "Category doesn't exist");
    }
    return transactionRepository.create(data);
}
async function deleteTransaction(id) {
    const transaction = await transactionRepository.findById(id)
    if (!transaction) {
        throw new AppError(404, "Transaction doesnt exist")
    }
    await transactionRepository.remove(id);
}
async function updateTransaction(id, data) {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) {
        throw new AppError(404, "Transaction doesnt exist");
    }

    if (data.categoryId !== undefined) {
        const category = await categoryRepository.findById(data.categoryId);
        if (!category) {
            throw new AppError(404, "Category doesn't exist");
        }
    }

    return transactionRepository.update(id, data);
}
module.exports = { updateTransaction, monthRange, listTransactions, createTransaction, deleteTransaction };