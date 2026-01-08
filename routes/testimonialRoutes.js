const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");

module.exports = (upload) => {
  router.get("/", testimonialController.getTestimonials);
  router.get("/:id", testimonialController.getTestimonialById);

  router.post(
    "/",
    upload.single("image"),
    testimonialController.createTestimonial
  );

  router.put(
    "/:id",
    upload.single("image"),
    testimonialController.updateTestimonial
  );

  router.delete("/:id", testimonialController.deleteTestimonial);

  return router;
};
