const express = require("express");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.get("/summary", analyticsController.summary);
router.get("/by-category", analyticsController.byCategory);
router.get("/trend", analyticsController.trend);

module.exports = router;