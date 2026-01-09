const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const governingController = require("../controllers/governingController");

router.get("/", governingController.getAll);
router.get("/:id", governingController.getById);
router.post("/add", upload.single("image"), governingController.create);
router.put("/:id", upload.single("image"), governingController.update);
router.delete("/:id", governingController.delete);

module.exports = router;
