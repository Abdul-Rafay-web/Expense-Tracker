jest.mock("../src/repositories/budgetRepository");
jest.mock("../src/repositories/categoryRepository");
jest.mock("../src/repositories/transactionRepository");

const budgetRepository = require("../src/repositories/budgetRepository");
const transactionRepository = require("../src/repositories/transactionRepository");
const budgetService = require("../src/services/budgetService");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("getBudgetStatus", () => {
    it("returns OK when under 80%", () => {
        expect(budgetService.getBudgetStatus(1000, 2000)).toBe("OK");
    });

    it("returns WARNING at exactly 80%", () => {
        expect(budgetService.getBudgetStatus(1600, 2000)).toBe("WARNING");
    });

    it("returns WARNING when spent equals the limit", () => {
        expect(budgetService.getBudgetStatus(2000, 2000)).toBe("WARNING");
    });

    it("returns EXCEEDED when over the limit", () => {
        expect(budgetService.getBudgetStatus(2001, 2000)).toBe("EXCEEDED");
    });
});

describe("getBudgetsWithStatus", () => {
    it("calculates spent, remaining and status for each budget", async () => {
        budgetRepository.findByMonth.mockResolvedValue([
            { id: 1, month: "2026-09", categoryId: 1, limitAmount: 200000, category: { id: 1, name: "Food" } },
            { id: 2, month: "2026-09", categoryId: 2, limitAmount: 50000, category: { id: 2, name: "Transport" } },
        ]);
        transactionRepository.sumByCategory.mockResolvedValue([
            { categoryId: 1, _sum: { amount: 170000 } },
        ]);

        const result = await budgetService.getBudgetsWithStatus(1, "2026-09");

        expect(result[0]).toMatchObject({ spent: 170000, remaining: 30000, percentUsed: 85, status: "WARNING" });
        expect(result[1]).toMatchObject({ spent: 0, remaining: 50000, percentUsed: 0, status: "OK" });
    });
});
const categoryRepository = require("../src/repositories/categoryRepository");

describe("setBudget", () => {
    it("refuses a category the user does not own and saves nothing", async () => {
        categoryRepository.findById.mockResolvedValue(null);

        await expect(budgetService.setBudget(1, { categoryId: 9, month: "2026-09", limitAmount: 5000 }))
            .rejects.toMatchObject({ statusCode: 404 });
        expect(categoryRepository.findById).toHaveBeenCalledWith(1, 9);
        expect(budgetRepository.upsert).not.toHaveBeenCalled();
    });

    it("creates or updates the budget for the user", async () => {
        categoryRepository.findById.mockResolvedValue({ id: 9, name: "Food" });
        budgetRepository.upsert.mockResolvedValue({ id: 3 });

        await budgetService.setBudget(1, { categoryId: 9, month: "2026-09", limitAmount: 5000 });

        expect(budgetRepository.upsert).toHaveBeenCalledWith({ userId: 1, categoryId: 9, month: "2026-09", limitAmount: 5000 });
    });
});

describe("getBudgetAlerts", () => {
    it("returns only budgets that are close to or over the limit", async () => {
        budgetRepository.findByMonth.mockResolvedValue([
            { id: 1, month: "2026-09", categoryId: 1, limitAmount: 1000, category: { name: "Food" } },
            { id: 2, month: "2026-09", categoryId: 2, limitAmount: 1000, category: { name: "Bills" } },
            { id: 3, month: "2026-09", categoryId: 3, limitAmount: 1000, category: { name: "Fun" } },
        ]);
        transactionRepository.sumByCategory.mockResolvedValue([
            { categoryId: 1, _sum: { amount: 100 } },
            { categoryId: 2, _sum: { amount: 900 } },
            { categoryId: 3, _sum: { amount: 1300 } },
        ]);

        const alerts = await budgetService.getBudgetAlerts(1, "2026-09");

        expect(alerts.map((a) => [a.category.name, a.status])).toEqual([["Bills", "WARNING"], ["Fun", "EXCEEDED"]]);
    });
});

describe("deleteBudget", () => {
    it("throws 404 for a budget the user does not own", async () => {
        budgetRepository.findById.mockResolvedValue(null);

        await expect(budgetService.deleteBudget(1, 99)).rejects.toMatchObject({ statusCode: 404 });
        expect(budgetRepository.remove).not.toHaveBeenCalled();
    });

    it("removes an existing budget", async () => {
        budgetRepository.findById.mockResolvedValue({ id: 3 });

        await budgetService.deleteBudget(1, 3);

        expect(budgetRepository.remove).toHaveBeenCalledWith(3);
    });
});
