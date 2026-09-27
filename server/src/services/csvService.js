const Papa = require("papaparse");
const transactionService = require("./transactionService");
const transactionRepository = require("../repositories/transactionRepository");
const { csvRowSchema } = require("../validators/csvValidator");
const { AppError } = require("../errors");

const CSV_COLUMNS = ["date", "type", "category", "amount", "note"];
const MAX_IMPORT_ROWS = 1000;

function paisaToRupees(paisa) {
    return (paisa / 100).toFixed(2);
}

async function exportTransactionsCsv(filters) {
    const transactions = await transactionService.listTransactions(filters);

    const rows = transactions.map((transaction) => [
        transaction.date.toISOString().slice(0, 10),
        transaction.type,
        transaction.category.name,
        paisaToRupees(transaction.amount),
        transaction.note ?? "",
    ]);

    return Papa.unparse({ fields: CSV_COLUMNS, data: rows });
}

function describeIssues(error) {
    return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

async function importTransactionsCsv(csvText) {
    const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (parsed.data.length === 0) {
        throw new AppError(400, "The CSV file has no data rows");
    }
    if (parsed.data.length > MAX_IMPORT_ROWS) {
        throw new AppError(400, `A CSV file can have at most ${MAX_IMPORT_ROWS} rows`);
    }

    const validRows = [];
    const rowErrors = [];

    parsed.data.forEach((row, index) => {
        const result = csvRowSchema.safeParse(row);
        if (result.success) {
            validRows.push(result.data);
        } else {
            rowErrors.push({ line: index + 2, problem: describeIssues(result.error) });
        }
    });

    if (rowErrors.length > 0) {
        throw new AppError(400, "The CSV file has invalid rows. Nothing was imported.", rowErrors);
    }

    return transactionRepository.importWithCategories(validRows);
}

module.exports = { exportTransactionsCsv, importTransactionsCsv };
