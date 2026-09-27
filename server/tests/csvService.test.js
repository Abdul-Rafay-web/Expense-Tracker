jest.mock("../src/repositories/transactionRepository");
jest.mock("../src/services/transactionService");

const transactionRepository = require("../src/repositories/transactionRepository");
const transactionService = require("../src/services/transactionService");
const csvService = require("../src/services/csvService");

const HEADER = "date,type,category,amount,note";

beforeEach(() => {
    jest.resetAllMocks();
});

describe("exportTransactionsCsv", () => {
    it("writes rupees with two decimals and quotes notes that contain commas", async () => {
        transactionService.listTransactions.mockResolvedValue([
            { date: new Date("2026-09-10T00:00:00Z"), type: "EXPENSE", category: { name: "Food" }, amount: 150050, note: "Groceries, weekly" },
            { date: new Date("2026-09-01T00:00:00Z"), type: "INCOME", category: { name: "Salary" }, amount: 15000000, note: null },
        ]);

        const csv = await csvService.exportTransactionsCsv(1, { month: "2026-09" });

        expect(transactionService.listTransactions).toHaveBeenCalledWith(1, { month: "2026-09" });
        expect(csv).toBe(`${HEADER}\r\n2026-09-10,EXPENSE,Food,1500.50,"Groceries, weekly"\r\n2026-09-01,INCOME,Salary,150000.00,`);
    });

    it("still writes the header row when there is nothing to export", async () => {
        transactionService.listTransactions.mockResolvedValue([]);

        expect(await csvService.exportTransactionsCsv(1, {})).toBe(`${HEADER}\r\n`);
    });
});

describe("importTransactionsCsv", () => {
    it("rejects a file without data rows", async () => {
        await expect(csvService.importTransactionsCsv(1, HEADER)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("rejects a file with more than 1,000 rows", async () => {
        const rows = Array.from({ length: 1001 }, () => "2026-09-01,EXPENSE,Food,10,");

        await expect(csvService.importTransactionsCsv(1, [HEADER, ...rows].join("\n"))).rejects.toMatchObject({ statusCode: 400 });
        expect(transactionRepository.importWithCategories).not.toHaveBeenCalled();
    });

    it("reports every invalid line and saves nothing", async () => {
        const csv = [HEADER, "2026-09-01,EXPENSE,Food,500,", "2026-02-31,EXPENSE,Food,500,", "2026-09-03,SPENDING,Food,-20,"].join("\n");

        const failure = await csvService.importTransactionsCsv(1, csv).catch((e) => e);

        expect(failure).toMatchObject({ statusCode: 400 });
        expect(failure.details.map((d) => d.line)).toEqual([3, 4]);
        expect(failure.details[1].problem).toMatch(/type/);
        expect(transactionRepository.importWithCategories).not.toHaveBeenCalled();
    });

    it("accepts headers in any case and passes clean rows to the repository", async () => {
        transactionRepository.importWithCategories.mockResolvedValue({ imported: 1, categoriesCreated: 0 });
        const csv = [" Date , TYPE ,Category,Amount,Note", "2026-09-03,income,Salary,1500.5,Bonus"].join("\n");

        const result = await csvService.importTransactionsCsv(4, csv);

        expect(result).toEqual({ imported: 1, categoriesCreated: 0 });
        const [userId, rows] = transactionRepository.importWithCategories.mock.calls[0];
        expect(userId).toBe(4);
        expect(rows[0]).toMatchObject({ type: "INCOME", category: "Salary", amount: 150050, note: "Bonus" });
    });
});

describe("importTransactionsCsv line numbers", () => {
    it("reports the real line in the file when there are blank lines", async () => {
        const csv = [HEADER, "2026-09-01,EXPENSE,Food,500,", "", "", "2026-02-31,EXPENSE,Food,500,"].join("\n");

        const failure = await csvService.importTransactionsCsv(1, csv).catch((e) => e);

        expect(failure.details.map((d) => d.line)).toEqual([5]);
    });
});
