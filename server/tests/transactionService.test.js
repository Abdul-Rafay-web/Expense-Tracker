jest.mock("../src/repositories/transactionRepository");
jest.mock("../src/repositories/categoryRepository");

const transactionRepository = require("../src/repositories/transactionRepository");
const categoryRepository = require("../src/repositories/categoryRepository");
const transactionService = require("../src/services/transactionService");


beforeEach(() => {
    jest.resetAllMocks();
});

describe("createTransaction", () => {
    it("throws 404 when category doesnt exist", async () => {
        categoryRepository.findById.mockResolvedValue(null);
        await expect(transactionService.createTransaction({ categoryId: 99 }))
            .rejects.toMatchObject({ statusCode: 404 });
        expect(transactionRepository.create).not.toHaveBeenCalled();
    });
});

describe("monthRange", () => {
    it("rolls December over into the next year", () => {
        const { start, end } = transactionService.monthRange("2026-12");

        expect(start.toISOString()).toBe("2026-12-01T00:00:00.000Z");
        expect(end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
    });
});
describe("updateTransaction", () => {
    it("throws 404 and does not save when the new category does not exist", async () => {
        transactionRepository.findById.mockResolvedValue({ id: 1, categoryId: 1 });
        categoryRepository.findById.mockResolvedValue(null);

        await expect(transactionService.updateTransaction(1, { categoryId: 999 }))
            .rejects.toMatchObject({ statusCode: 404 });

        expect(transactionRepository.update).not.toHaveBeenCalled();
    });
});

