const mongoose = require("mongoose");

const ExecutiveMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    image: { type: String, required: true }, 
    imagePublicId: { type: String }, 
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ExecutiveMember ||
  mongoose.model("ExecutiveMember", ExecutiveMemberSchema);
