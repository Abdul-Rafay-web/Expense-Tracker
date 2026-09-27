const express = require("express");
const budgetController = require("../controllers/budgetController");

const router = express.Router();

router.get("/", budgetController.list);
router.get("/alerts", budgetController.alerts);
router.put("/", budgetController.set);
router.delete("/:id", budgetController.remove);

module.exports = router;