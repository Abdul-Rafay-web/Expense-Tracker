const express = require("express");
const cors = require("cors");
const categoryRoutes = require("./routes/categoryRoutes");
const errorHandler = require("./middleware/errorHandler");
const transactionRoutes = require("../src/routes/transactionRoute")
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use(errorHandler);
module.exports = app;