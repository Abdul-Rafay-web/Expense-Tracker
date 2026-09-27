const budgetService = require("../services/budgetService");
const { setBudgetSchema, monthQuerySchema } = require("../validators/budgetValidator");
const { idParamSchema } = require("../validators/categoryValidators");

async function list(req, res) {
    const { month } = monthQuerySchema.parse(req.query)
    const budgets = await budgetService.getBudgetsWithStatus(req.user.id, month);
    res.json(budgets);
}

async function alerts(req, res) {
    const { month } = monthQuerySchema.parse(req.query)
    const alerts = await budgetService.getBudgetAlerts(req.user.id, month);
    res.json(alerts);
}
async function set(req, res) {
    const data = setBudgetSchema.parse(req.body)
    const budget = await budgetService.setBudget(req.user.id, data);
    res.json(budget);
}
async function remove(req, res) {
    const { id } = idParamSchema.parse(req.params)
    await budgetService.deleteBudget(req.user.id, id)
    res.status(204).end();
}

module.exports = { list, alerts, set, remove };