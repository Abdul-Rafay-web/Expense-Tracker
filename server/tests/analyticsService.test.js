jest.mock("../src/repositories/transactionRepository");
jest.mock("../src/repositories/categoryRepository");

const transactionRepository = require("../src/repositories/transactionRepository");
const categoryRepository = require("../src/repositories/categoryRepository");
const analyticsService = require("../src/services/analyticsService");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("getMonthlySummary", () => {
    it("calculates income, expense and balance", async () => {
        transactionRepository.sumByType.mockResolvedValue([
            { type: "INCOME", _sum: { amount: 10000 } },
            { type: "EXPENSE", _sum: { amount: 4000 } },
        ]);

        const result = await analyticsService.getMonthlySummary("2026-09");

        expect(result).toEqual({ month: "2026-09", totalIncome: 10000, totalExpenses: 4000, balance: 6000 });
    });

    it("returns zeros for a month with no transactions", async () => {
        transactionRepository.sumByType.mockResolvedValue([]);

        const result = await analyticsService.getMonthlySummary("2025-01");

        expect(result).toEqual({ month: "2025-01", totalIncome: 0, totalExpenses: 0, balance: 0 });
    });
});

describe("getCategoryBreakdown", () => {
    it("adds names, percentages and sorts biggest first", async () => {
        transactionRepository.sumByCategory.mockResolvedValue([
            { categoryId: 1, _sum: { amount: 2500 } },
            { categoryId: 2, _sum: { amount: 7500 } },
        ]);
        categoryRepository.findAll.mockResolvedValue([
            { id: 1, name: "Food" },
            { id: 2, name: "Bills" },
        ]);

        const result = await analyticsService.getCategoryBreakdown("2026-09", "EXPENSE");

        expect(result).toEqual([
            { categoryId: 2, categoryName: "Bills", total: 7500, percentage: 75 },
            { categoryId: 1, categoryName: "Food", total: 2500, percentage: 25 },
        ]);
    });

    it("returns an empty list when nothing was spent", async () => {
        transactionRepository.sumByCategory.mockResolvedValue([]);
        categoryRepository.findAll.mockResolvedValue([{ id: 1, name: "Food" }]);

        const result = await analyticsService.getCategoryBreakdown("2026-09", "EXPENSE");

        expect(result).toEqual([]);
    });
});