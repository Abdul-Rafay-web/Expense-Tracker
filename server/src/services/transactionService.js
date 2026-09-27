const transactionRepository = require("../repositories/transactionRepository");
const categoryRepository = require("../repositories/categoryRepository");
const { AppError } = require("../errors");
const { monthRange } = require("../utils/dates");
const { BASE_CURRENCY, toBaseAmount } = require("../utils/currency");

function withCurrency(amount, currency) {
    return {
        currency,
        amount: toBaseAmount(amount, currency),
        originalAmount: currency === BASE_CURRENCY ? null : amount,
    };
}

async function ensureCategory(userId, categoryId) {
    const category = await categoryRepository.findById(userId, categoryId);
    if (!category) {
        throw new AppError(404, "Category doesn't exist");
    }
}

async function findOwnTransaction(userId, id) {
    const transaction = await transactionRepository.findById(userId, id);
    if (!transaction) {
        throw new AppError(404, "Transaction doesnt exist");
    }
    return transaction;
}

async function listTransactions(userId, { month, type }) {
    const range = month ? monthRange(month) : {};
    return transactionRepository.findMany({ userId, type, ...range });
}

async function createTransaction(userId, data) {
    await ensureCategory(userId, data.categoryId);
    const { amount, currency = BASE_CURRENCY, ...rest } = data;
    return transactionRepository.create({ ...rest, ...withCurrency(amount, currency), userId });
}

async function deleteTransaction(userId, id) {
    await findOwnTransaction(userId, id);
    await transactionRepository.remove(id);
}

async function updateTransaction(userId, id, data) {
    const existing = await findOwnTransaction(userId, id);
    if (data.categoryId !== undefined) {
        await ensureCategory(userId, data.categoryId);
    }
    const { amount, currency, ...rest } = data;
    if (amount === undefined && currency === undefined) {
        return transactionRepository.update(id, rest);
    }
    const nextCurrency = currency ?? existing.currency;
    const nextAmount = amount ?? existing.originalAmount ?? existing.amount;
    return transactionRepository.update(id, { ...rest, ...withCurrency(nextAmount, nextCurrency) });
}

module.exports = { listTransactions, createTransaction, updateTransaction, deleteTransaction };
