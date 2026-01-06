const express = require("express");
const router = express.Router();
const controller = require("../controllers/testimonialController");

// 👇 USE SAME MULTER FROM SERVER
module.exports = (upload) => {
  router.get("/", controller.getTestimonials);
  router.get("/:id", controller.getTestimonial);
  router.post("/", upload.single("image"), controller.createTestimonial);
  router.put("/:id", upload.single("image"), controller.updateTestimonial);
  router.delete("/:id", controller.deleteTestimonial);

  return router;
};
