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
        transactionRepository.sumExpensesByCategory.mockResolvedValue([
            { categoryId: 1, _sum: { amount: 170000 } },
        ]);

        const result = await budgetService.getBudgetsWithStatus("2026-09");

        expect(result[0]).toMatchObject({ spent: 170000, remaining: 30000, percentUsed: 85, status: "WARNING" });
        expect(result[1]).toMatchObject({ spent: 0, remaining: 50000, percentUsed: 0, status: "OK" });
    });
});