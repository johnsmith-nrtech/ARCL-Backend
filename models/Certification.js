const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    image: { type: String, required: true },
    imagePublicId: { type: String,  },

    pdf: { type: String, required: true },
    pdfPublicId: { type: String, },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Certification ||
  mongoose.model("Certification", CertificationSchema);
