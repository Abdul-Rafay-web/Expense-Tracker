const express = require("express");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

router.get("/export", transactionController.exportCsv);
router.post("/import", express.text({ type: "text/csv", limit: "1mb" }), transactionController.importCsv);
router.get("/", transactionController.list);
router.post("/", transactionController.create);
router.delete("/:id", transactionController.remove);
router.patch("/:id", transactionController.update);
module.exports = router;