const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); 
const CertificationController = require("../controllers/certificationController");

// GET all certifications
router.get("/", CertificationController.getAll);

// GET certification by ID
router.get("/:id", CertificationController.getById);

// CREATE certification
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  CertificationController.create
);

// UPDATE certification
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  CertificationController.update
);

// DELETE certification
router.delete("/:id", CertificationController.delete);

module.exports = router;
