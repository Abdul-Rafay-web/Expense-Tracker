const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const errorHandler = require("./middleware/errorHandler");
const { requireAuth } = require("./middleware/requireAuth");
const { listCurrencies } = require("./utils/currency");

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY) {
    const hops = Number(process.env.TRUST_PROXY);
    app.set("trust proxy", Number.isNaN(hops) ? process.env.TRUST_PROXY : hops);
}
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.get("/api/currencies", (req, res) => {
    res.json(listCurrencies());
});
app.use("/api/auth", authRoutes);
app.use("/api/categories", requireAuth, categoryRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);
app.use("/api/budgets", requireAuth, budgetRoutes);
app.use("/api/analytics", requireAuth, analyticsRoutes);
app.use("/api", (req, res) => {
    res.status(404).json({ error: `No API endpoint for ${req.method} ${req.originalUrl}` });
});
app.use(errorHandler);

module.exports = app;
