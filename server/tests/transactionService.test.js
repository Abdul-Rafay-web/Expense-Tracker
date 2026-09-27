jest.mock("../src/repositories/transactionRepository");
jest.mock("../src/repositories/categoryRepository");

const transactionRepository = require("../src/repositories/transactionRepository");
const categoryRepository = require("../src/repositories/categoryRepository");
const transactionService = require("../src/services/transactionService");
const { monthRange } = require("../src/utils/dates");


beforeEach(() => {
    jest.resetAllMocks();
});

describe("createTransaction", () => {
    it("throws 404 when category doesnt exist", async () => {
        categoryRepository.findById.mockResolvedValue(null);
        await expect(transactionService.createTransaction(1, { categoryId: 99 }))
            .rejects.toMatchObject({ statusCode: 404 });
        expect(transactionRepository.create).not.toHaveBeenCalled();
    });
});

describe("monthRange", () => {
    it("rolls December over into the next year", () => {
        const { start, end } = monthRange("2026-12");

        expect(start.toISOString()).toBe("2026-12-01T00:00:00.000Z");
        expect(end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
    });
});
describe("updateTransaction", () => {
    it("throws 404 and does not save when the new category does not exist", async () => {
        transactionRepository.findById.mockResolvedValue({ id: 1, categoryId: 1 });
        categoryRepository.findById.mockResolvedValue(null);

        await expect(transactionService.updateTransaction(1, 1, { categoryId: 999 }))
            .rejects.toMatchObject({ statusCode: 404 });

        expect(transactionRepository.update).not.toHaveBeenCalled();
    });
});


describe("listTransactions", () => {
    it("turns a month into a date range for the user's query", async () => {
        transactionRepository.findMany.mockResolvedValue([]);

        await transactionService.listTransactions(1, { month: "2026-09", type: "EXPENSE" });

        const query = transactionRepository.findMany.mock.calls[0][0];
        expect(query.userId).toBe(1);
        expect(query.type).toBe("EXPENSE");
        expect(query.start.toISOString()).toBe("2026-09-01T00:00:00.000Z");
        expect(query.end.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    });

    it("lists everything when no month is given", async () => {
        transactionRepository.findMany.mockResolvedValue([]);

        await transactionService.listTransactions(1, {});

        expect(transactionRepository.findMany).toHaveBeenCalledWith({ userId: 1, type: undefined });
    });
});

describe("createTransaction ownership", () => {
    it("saves the transaction under the logged-in user", async () => {
        categoryRepository.findById.mockResolvedValue({ id: 2 });
        transactionRepository.create.mockResolvedValue({ id: 10 });

        await transactionService.createTransaction(1, { categoryId: 2, amount: 500 });

        expect(categoryRepository.findById).toHaveBeenCalledWith(1, 2);
        expect(transactionRepository.create).toHaveBeenCalledWith({ categoryId: 2, currency: "PKR", amount: 500, originalAmount: null, userId: 1 });
    });
});

describe("deleteTransaction", () => {
    it("throws 404 for a transaction the user does not own", async () => {
        transactionRepository.findById.mockResolvedValue(null);

        await expect(transactionService.deleteTransaction(1, 42)).rejects.toMatchObject({ statusCode: 404 });
        expect(transactionRepository.remove).not.toHaveBeenCalled();
    });

    it("updates without checking a category when none is sent", async () => {
        transactionRepository.findById.mockResolvedValue({ id: 5, currency: "PKR", amount: 500, originalAmount: null });

        await transactionService.updateTransaction(1, 5, { amount: 700 });

        expect(categoryRepository.findById).not.toHaveBeenCalled();
        expect(transactionRepository.update).toHaveBeenCalledWith(5, { currency: "PKR", amount: 700, originalAmount: null });
    });
});
