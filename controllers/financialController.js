const FinancialReport = require("../models/FinancialReport");
const cloudinary = require("../config/cloudinary");

// helper function to upload PDF to Cloudinary
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw" }, // PDF is raw file
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file.buffer);
  });
};

// GET all reports
exports.getAll = async (req, res) => {
  try {
    const reports = await FinancialReport.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET report by ID
exports.getById = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE report
exports.create = async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "PDF is required" });

    // Upload PDF to Cloudinary
    const pdfUpload = await uploadToCloudinary(req.file, "financial_reports");

    const newReport = new FinancialReport({
      title,
      pdf: pdfUpload.secure_url,
      pdfPublicId: pdfUpload.public_id,
    });
    await newReport.save();

    res.status(201).json(newReport);
  } catch (err) {
    console.error("CREATE REPORT ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE report
exports.update = async (req, res) => {
  try {
    const { title } = req.body;
    const report = await FinancialReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Replace PDF if new file uploaded
    if (req.file) {
      if (report.pdfPublicId) {
        await cloudinary.uploader.destroy(report.pdfPublicId, { resource_type: "raw" });
      }

      const pdfUpload = await uploadToCloudinary(req.file, "financial_reports");
      report.pdf = pdfUpload.secure_url;
      report.pdfPublicId = pdfUpload.public_id;
    }

    report.title = title || report.title;
    await report.save();

    res.json(report);
  } catch (err) {
    console.error("UPDATE REPORT ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE report
exports.delete = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    if (report.pdfPublicId) {
      await cloudinary.uploader.destroy(report.pdfPublicId, { resource_type: "raw" });
    }

    await report.deleteOne();
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("DELETE REPORT ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};
