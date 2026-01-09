const Certification = require("../models/Certification");
const cloudinary = require("../config/cloudinary");

// upload helper
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
};

// GET all
exports.getAll = async (req, res) => {
  try {
    const certifications = await Certification.find();
    res.json(certifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET by ID
exports.getById = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: "Certification not found" });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !req.files?.image || !req.files?.pdf) {
      return res.status(400).json({ error: "Title, image & pdf required" });
    }

    const imageUpload = await uploadToCloudinary(
      req.files.image[0],
      "certifications/images"
    );

    const pdfUpload = await uploadToCloudinary(
      req.files.pdf[0],
      "certifications/pdfs"
    );

    const cert = await Certification.create({
      title,
      image: imageUpload.secure_url,
      imagePublicId: imageUpload.public_id,
      pdf: pdfUpload.secure_url,
      pdfPublicId: pdfUpload.public_id,
    });

    res.status(201).json(cert);

  } catch (err) {
    console.error("CREATE CERT ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: "Certification not found" });

    if (req.body.title) cert.title = req.body.title;

    if (req.files?.image) {
      if (cert.imagePublicId) {
        await cloudinary.uploader.destroy(cert.imagePublicId);
      }
      const img = await uploadToCloudinary(req.files.image[0], "certifications/images");
      cert.image = img.secure_url;
      cert.imagePublicId = img.public_id;
    }

    if (req.files?.pdf) {
      if (cert.pdfPublicId) {
        await cloudinary.uploader.destroy(cert.pdfPublicId, { resource_type: "raw" });
      }
      const pdf = await uploadToCloudinary(req.files.pdf[0], "certifications/pdfs");
      cert.pdf = pdf.secure_url;
      cert.pdfPublicId = pdf.public_id;
    }

    await cert.save();
    res.json(cert);

  } catch (err) {
    console.error("UPDATE CERT ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: "Certification not found" });

    if (cert.imagePublicId) {
      await cloudinary.uploader.destroy(cert.imagePublicId);
    }

    if (cert.pdfPublicId) {
      await cloudinary.uploader.destroy(cert.pdfPublicId, { resource_type: "raw" });
    }

    await cert.deleteOne();
    res.json({ message: "Certification deleted" });

  } catch (err) {
    console.error("DELETE CERT ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};
