const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const ExecutiveController = require("../controllers/executiveController");

router.get("/", ExecutiveController.getAll);
router.get("/:id", ExecutiveController.getById);
router.post("/", upload.single("image"), ExecutiveController.create);
router.put("/:id", upload.single("image"), ExecutiveController.update);
router.delete("/:id", ExecutiveController.delete);

module.exports = router;
