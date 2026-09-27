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
describe("monthsBetween", () => {
    it("lists every month and crosses into the next year", () => {
        expect(analyticsService.monthsBetween("2026-11", "2027-02"))
            .toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
    });

    it("returns a single month when from and to are the same", () => {
        expect(analyticsService.monthsBetween("2026-09", "2026-09")).toEqual(["2026-09"]);
    });
});

describe("getMonthlyTrend", () => {
    it("totals each month and keeps empty months as zero", async () => {
        transactionRepository.findInRange.mockResolvedValue([
            { type: "INCOME", amount: 1000, date: new Date("2026-07-05") },
            { type: "EXPENSE", amount: 300, date: new Date("2026-07-20") },
            { type: "EXPENSE", amount: 200, date: new Date("2026-09-01") },
        ]);

        const result = await analyticsService.getMonthlyTrend("2026-07", "2026-09");

        expect(result).toEqual([
            { month: "2026-07", totalIncome: 1000, totalExpenses: 300, balance: 700 },
            { month: "2026-08", totalIncome: 0, totalExpenses: 0, balance: 0 },
            { month: "2026-09", totalIncome: 0, totalExpenses: 200, balance: -200 },
        ]);
    });
});
