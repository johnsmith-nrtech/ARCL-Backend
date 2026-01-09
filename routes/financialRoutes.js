const express = require("express");
const router = express.Router();
const multer = require("multer");
const FinancialController = require("../controllers/financialController");

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// CRUD routes
router.get("/", FinancialController.getAll);
router.get("/:id", FinancialController.getById);
router.post("/", upload.single("pdf"), FinancialController.create);
router.put("/:id", upload.single("pdf"), FinancialController.update);
router.delete("/:id", FinancialController.delete);

module.exports = router;
