const mongoose = require("mongoose");

const FinancialReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    pdf: { type: String, required: true },
    pdfPublicId: { type: String, }, 
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FinancialReport ||
  mongoose.model("FinancialReport", FinancialReportSchema);
