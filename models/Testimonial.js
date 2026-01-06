const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "Parent" },
    message: { type: String, required: true },
    image: { type: String }, // /uploads/filename
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
