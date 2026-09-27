const transactionRepository = require("../repositories/transactionRepository");
const categoryRepository = require("../repositories/categoryRepository");
const { monthRange } = require("./transactionService");

function totalForType(totals, type) {
    const row = totals.find((total) => total.type === type);
    return row ? row._sum.amount : 0;
}

async function getMonthlySummary(month) {
    const { start, end } = monthRange(month);
    const totals = await transactionRepository.sumByType(start, end)
    const totalIncome = totalForType(totals, "INCOME");
    const totalExpenses = totalForType(totals, "EXPENSE");
    return {
        month,
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
    };
}

async function getCategoryBreakdown(month, type) {
    const { start, end } = monthRange(month);
    const totals = await transactionRepository.sumByCategory(type, start, end);
    const categories = await categoryRepository.findAll();

    const nameById = new Map(categories.map((category) => [category.id, category.name]));
    const grandTotal = totals.reduce((sum, row) => sum + row._sum.amount, 0);

    const breakdown = totals.map((row) => ({
        categoryId: row.categoryId,
        categoryName: nameById.get(row.categoryId),
        total: row._sum.amount,
        percentage: Math.round((row._sum.amount / grandTotal) * 100),
    }));

    return breakdown.sort((a, b) => b.total - a.total);
}

module.exports = { getMonthlySummary, getCategoryBreakdown };