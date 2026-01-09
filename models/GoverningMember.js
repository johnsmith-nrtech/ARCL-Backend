const mongoose = require("mongoose");

const GoverningSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    image: { type: String, required: true }, 
    imagePublicId: { type: String }, 
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.GoverningMember ||
  mongoose.model("GoverningMember", GoverningSchema);
