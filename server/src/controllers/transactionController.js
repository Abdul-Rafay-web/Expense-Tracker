const transactionService = require("../services/transactionService");
const csvService = require("../services/csvService");
const { AppError } = require("../errors");
const { createTransactionSchema, updateTransactionSchema, listTransactionsQuerySchema } = require("../validators/transactionValidator");
const { idParamSchema } = require("../validators/categoryValidators");

async function list(req, res) {
    const filters = listTransactionsQuerySchema.parse(req.query);
    const transaction = await transactionService.listTransactions(req.user.id, filters);
    res.json(transaction);
}
async function create(req, res) {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await transactionService.createTransaction(req.user.id, data);
    res.status(201).json(transaction);
}

async function remove(req, res) {
    const { id } = idParamSchema.parse(req.params);
    await transactionService.deleteTransaction(req.user.id, id);
    res.status(204).end();
}

async function update(req, res) {
    const { id } = idParamSchema.parse(req.params);
    const data = updateTransactionSchema.parse(req.body);
    const transaction = await transactionService.updateTransaction(req.user.id, id, data);
    res.json(transaction);
}
async function exportCsv(req, res) {
    const filters = listTransactionsQuerySchema.parse(req.query);
    const csv = await csvService.exportTransactionsCsv(req.user.id, filters);
    res.attachment(`transactions-${filters.month ?? "all"}.csv`);
    res.send(csv);
}

async function importCsv(req, res) {
    if (typeof req.body !== "string" || req.body.trim() === "") {
        throw new AppError(400, "Send the CSV file as text with Content-Type: text/csv");
    }
    const result = await csvService.importTransactionsCsv(req.user.id, req.body);
    res.status(201).json(result);
}

module.exports = { list, create, remove, update, exportCsv, importCsv };