const budgetRepository = require("../repositories/budgetRepository");
const categoryRepository = require("../repositories/categoryRepository");
const transactionRepository = require("../repositories/transactionRepository");
const { monthRange } = require("./transactionService");
const { AppError } = require("../errors");

const WARNING_THRESHOLD = 0.8;

function getBudgetStatus(spent, limit) {
    if (spent > limit) {
        return "EXCEEDED";
    }
    if (spent >= limit * WARNING_THRESHOLD) {
        return "WARNING";
    }
    return "OK";
}

async function setBudget(userId, { categoryId, month, limitAmount }) {
    const category = await categoryRepository.findById(userId, categoryId);
    if (!category) {
        throw new AppError(404, "Category not found");
    }
    return budgetRepository.upsert({ userId, categoryId, month, limitAmount });
}

async function getBudgetsWithStatus(userId, month) {
    const { start, end } = monthRange(month);
    const budgets = await budgetRepository.findByMonth(userId, month);
    const totals = await transactionRepository.sumExpensesByCategory(userId, start, end);

    const spentByCategory = new Map(
        totals.map((total) => [total.categoryId, total._sum.amount ?? 0])
    );

    return budgets.map((budget) => {
        const spent = spentByCategory.get(budget.categoryId) ?? 0;
        return {
            id: budget.id,
            month: budget.month,
            category: budget.category,
            limitAmount: budget.limitAmount,
            spent,
            remaining: budget.limitAmount - spent,
            percentUsed: Math.round((spent / budget.limitAmount) * 100),
            status: getBudgetStatus(spent, budget.limitAmount),
        };
    });
}

async function getBudgetAlerts(userId, month) {
    const budgets = await getBudgetsWithStatus(userId, month);
    return budgets.filter((budget) => budget.status !== "OK");
}

async function deleteBudget(userId, id) {
    const budget = await budgetRepository.findById(userId, id);
    if (!budget) {
        throw new AppError(404, "Budget not found");
    }
    await budgetRepository.remove(id);
}

module.exports = { getBudgetStatus, setBudget, getBudgetsWithStatus, getBudgetAlerts, deleteBudget };