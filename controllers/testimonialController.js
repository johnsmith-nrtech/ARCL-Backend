const Testimonial = require("../models/Testimonial");
const mongoose = require("mongoose");

/* ================= GET ALL ================= */
exports.getTestimonials = async (req, res) => {
  try {
    const data = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ONE ================= */
exports.getTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Prevent NaN / invalid ObjectId crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }

    const data = await Testimonial.findById(id);

    if (!data) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE ================= */
exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial({
      name: req.body.name,
      role: req.body.role || "Parent",
      message: req.body.message,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
  exports.updateTestimonial = async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid testimonial ID" });
      }

      const testimonial = await Testimonial.findById(id);

      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }

      // Update fields only if provided
      testimonial.name = req.body.name ?? testimonial.name;
      testimonial.role = req.body.role ?? testimonial.role;
      testimonial.message = req.body.message ?? testimonial.message;

      // ✅ Handle image upload
      if (req.file) {
        // Use BASE_URL in production for full URL
        const baseUrl = process.env.BASE_URL || ""; // e.g., "https://yourdomain.com"
        testimonial.image = `${baseUrl}/uploads/${req.file.filename}`;
      }

      await testimonial.save();

      res.status(200).json(testimonial);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  };

/* ================= DELETE ================= */
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }

    const deleted = await Testimonial.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
