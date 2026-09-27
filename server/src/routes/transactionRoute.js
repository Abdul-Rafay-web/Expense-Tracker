const express = require("express");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

router.get("/", transactionController.list);
router.post("/", transactionController.create);
router.delete("/:id", transactionController.remove);
router.patch("/:id", transactionController.update);
module.exports = router;