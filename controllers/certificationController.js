const Certification = require("../models/Certification");
const path = require("path");
const fs = require("fs");

// helper: safe unlink
const safeUnlink = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(process.cwd(), "public", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, () => {});
  }
};

// ================= GET ALL =================
exports.getAll = async (req, res) => {
  try {
    const certifications = await Certification.find().sort({ createdAt: -1 });
    res.json(certifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET BY ID =================
exports.getById = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ error: "Certification not found" });
    }
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CREATE =================
exports.create = async (req, res) => {
  try {
    const { title, imageUrl, pdfUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // image: URL OR uploaded file
    let image = "";
    if (imageUrl) {
      image = imageUrl;
    } else if (req.files?.image?.[0]) {
      image = `/uploads/${req.files.image[0].filename}`;
    }

    // pdf: URL OR uploaded file
    let pdf = "";
    if (pdfUrl) {
      pdf = pdfUrl;
    } else if (req.files?.pdf?.[0]) {
      pdf = `/uploads/${req.files.pdf[0].filename}`;
    }

    if (!image || !pdf) {
      return res.status(400).json({ error: "Image and PDF are required" });
    }

    const newCert = await Certification.create({
      title,
      image,
      pdf,
    });

    res.status(201).json(newCert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE =================
exports.update = async (req, res) => {
  try {
    const { title, imageUrl, pdfUrl } = req.body;
    const cert = await Certification.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({ error: "Certification not found" });
    }

    // ---------- IMAGE ----------
    if (imageUrl) {
      // delete old local image
      if (cert.image?.startsWith("/uploads")) {
        safeUnlink(cert.image);
      }
      cert.image = imageUrl;
    } 
    else if (req.files?.image?.[0]) {
      if (cert.image?.startsWith("/uploads")) {
        safeUnlink(cert.image);
      }
      cert.image = `/uploads/${req.files.image[0].filename}`;
    }

    // ---------- PDF ----------
    if (pdfUrl) {
      if (cert.pdf?.startsWith("/uploads")) {
        safeUnlink(cert.pdf);
      }
      cert.pdf = pdfUrl;
    } 
    else if (req.files?.pdf?.[0]) {
      if (cert.pdf?.startsWith("/uploads")) {
        safeUnlink(cert.pdf);
      }
      cert.pdf = `/uploads/${req.files.pdf[0].filename}`;
    }

    // ---------- TITLE ----------
    if (title) {
      cert.title = title;
    }

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

    if (cert.image?.startsWith("/uploads")) {
      safeUnlink(cert.image);
    }

    if (cert.pdf?.startsWith("/uploads")) {
      safeUnlink(cert.pdf);
    }

    await cert.deleteOne();
    res.json({ message: "Certification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
