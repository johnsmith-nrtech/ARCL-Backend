const Certification = require("../models/Certification");
const path = require("path");
const fs = require("fs");

/**
 * Helper: get all images (URL + uploaded files)
 */
const getAllImages = (req) => {
  const images = [];

  // URL based image (DTO style)
  if (req.body.url) {
    images.push({
      url: req.body.url,
      type: req.body.type || "gallery",
      order: Number(req.body.order) || 0,
    });
  }

  // Uploaded images (single / multiple)
  if (req.files?.image) {
    req.files.image.forEach((file, index) => {
      images.push({
        url: `/uploads/${file.filename}`,
        type: req.body.type || "gallery",
        order:
          req.body.order !== undefined
            ? Number(req.body.order) + index
            : index,
      });
    });
  }

  return images;
};

// ================= GET ALL =================
exports.getAll = async (req, res) => {
  try {
    const certifications = await Certification.find();
    res.json(certifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET BY ID =================
exports.getById = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: "Certification not found" });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CREATE =================
exports.create = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const images = getAllImages(req);
    if (!images.length) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const pdf = req.files?.pdf
      ? `/uploads/${req.files.pdf[0].filename}`
      : "";

    if (!pdf) {
      return res.status(400).json({ error: "PDF is required" });
    }

    const cert = await Certification.create({
      title,
      images,
      pdf,
    });

    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE =================
exports.update = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ error: "Certification not found" });
    }

    // Replace images if new image/url sent
    if (req.files?.image || req.body.url) {
      // delete old local images
      cert.images.forEach((img) => {
        if (img.url.startsWith("/uploads")) {
          fs.unlink(
            path.join(process.cwd(), "public", img.url),
            () => {}
          );
        }
      });

      cert.images = getAllImages(req);
    }

    // Replace PDF
    if (req.files?.pdf) {
      if (cert.pdf) {
        fs.unlink(
          path.join(process.cwd(), "public", cert.pdf),
          () => {}
        );
      }
      cert.pdf = `/uploads/${req.files.pdf[0].filename}`;
    }

    cert.title = req.body.title || cert.title;
    await cert.save();

    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE =================
exports.delete = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ error: "Certification not found" });
    }

    // delete images
    cert.images.forEach((img) => {
      if (img.url.startsWith("/uploads")) {
        fs.unlink(
          path.join(process.cwd(), "public", img.url),
          () => {}
        );
      }
    });

    // delete pdf
    if (cert.pdf) {
      fs.unlink(
        path.join(process.cwd(), "public", cert.pdf),
        () => {}
      );
    }

    await cert.deleteOne();
    res.json({ message: "Certification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
