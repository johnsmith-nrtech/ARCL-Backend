const Testimonial = require("../models/Testimonial");
const fs = require("fs");
const path = require("path");

/* ================= CREATE ================= */
exports.createTestimonial = async (req, res) => {
  try {
    const { name, role, message } = req.body;

    if (!name || !role || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const testimonial = await Testimonial.create({
      name,
      role,
      message,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL ================= */
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE ================= */
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Remove old image if new uploaded
    if (req.file && testimonial.image) {
      const oldPath = path.join(
        __dirname,
        "..",
        "public",
        testimonial.image
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    testimonial.name = req.body.name || testimonial.name;
    testimonial.role = req.body.role || testimonial.role;
    testimonial.message = req.body.message || testimonial.message;
    testimonial.image = req.file
      ? `/uploads/${req.file.filename}`
      : testimonial.image;

    await testimonial.save();

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE ================= */
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Remove image from server
    if (testimonial.image) {
      const imgPath = path.join(__dirname, "..", "public", testimonial.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await testimonial.deleteOne();

    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
