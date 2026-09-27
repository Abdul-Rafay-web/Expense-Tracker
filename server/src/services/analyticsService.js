const transactionRepository = require("../repositories/transactionRepository");
const categoryRepository = require("../repositories/categoryRepository");
const { monthRange } = require("./transactionService");

function totalForType(totals, type) {
    const row = totals.find((total) => total.type === type);
    return row ? row._sum.amount : 0;
}

async function getMonthlySummary(userId, month) {
    const { start, end } = monthRange(month);
    const totals = await transactionRepository.sumByType(userId, start, end)
    const totalIncome = totalForType(totals, "INCOME");
    const totalExpenses = totalForType(totals, "EXPENSE");
    return {
        month,
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
    };
}

async function getCategoryBreakdown(userId, month, type) {
    const { start, end } = monthRange(month);
    const totals = await transactionRepository.sumByCategory(userId, type, start, end);
    const categories = await categoryRepository.findAll(userId);

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

function monthsBetween(from, to) {
    const months = [];
    let [year, month] = from.split("-").map(Number);
    const [endYear, endMonth] = to.split("-").map(Number);

    while (year < endYear || (year === endYear && month <= endMonth)) {
        months.push(`${year}-${String(month).padStart(2, "0")}`);
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    return months;
}

async function getMonthlyTrend(userId, from, to) {
    const months = monthsBetween(from, to);
    const { start } = monthRange(from);
    const { end } = monthRange(to);
    const transactions = await transactionRepository.findInRange(userId, start, end);

    const trend = new Map(
        months.map((month) => [month, { month, totalIncome: 0, totalExpenses: 0, balance: 0 }])
    );

    for (const transaction of transactions) {
        const row = trend.get(transaction.date.toISOString().slice(0, 7));
        if (transaction.type === "INCOME") {
            row.totalIncome += transaction.amount;
        } else {
            row.totalExpenses += transaction.amount;
        }
    }

    for (const row of trend.values()) {
        row.balance = row.totalIncome - row.totalExpenses;
    }

    return [...trend.values()];
}

module.exports = { getMonthlySummary, getCategoryBreakdown, monthsBetween, getMonthlyTrend };