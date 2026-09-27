const transactionService = require("../services/transactionService");
const { createTransactionSchema, listTransactionsQuerySchema } = require("../validators/transactionValidator");
const { idParamSchema } = require("../validators/categoryValidators");

async function list(req, res) {
    const filters = listTransactionsQuerySchema.parse(req.query);
    const transaction = await transactionService.listTransactions(filters);
    res.json(transaction);
}
async function create(req, res) {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await transactionService.createTransaction(data);
    res.status(201).json(transaction);
}

async function remove(req, res) {
    const { id } = idParamSchema.parse(req.params);
    await transactionService.deleteTransaction(id);
    res.status(204).end();
}
module.exports = { list, create, remove };