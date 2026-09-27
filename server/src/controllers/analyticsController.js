const analyticsService = require("../services/analyticsService");
const { summaryQuerySchema, breakdownQuerySchema, trendQuerySchema } = require("../validators/analyticsValidator");

async function summary(req, res) {
    const { month } = summaryQuerySchema.parse(req.query);
    const result = await analyticsService.getMonthlySummary(month);
    res.json(result);
}

async function byCategory(req, res) {
    const { month, type } = breakdownQuerySchema.parse(req.query);
    const result = await analyticsService.getCategoryBreakdown(month, type);
    res.json(result);
}

async function trend(req, res) {
    const { from, to } = trendQuerySchema.parse(req.query);
    const result = await analyticsService.getMonthlyTrend(from, to);
    res.json(result);
}

module.exports = { summary, byCategory, trend };