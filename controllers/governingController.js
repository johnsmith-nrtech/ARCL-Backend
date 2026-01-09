const Governing = require("../models/GoverningMember");
const cloudinary = require("../config/cloudinary");

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(file.buffer);
  });

// GET all members
exports.getAll = async (req, res) => {
  try {
    const members = await Governing.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET member by ID
exports.getById = async (req, res) => {
  try {
    const member = await Governing.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE member
exports.create = async (req, res) => {
  try {
    const { name, position } = req.body;

    if (!name || !position || !req.file)
      return res.status(400).json({ error: "Name, position & image required" });

    const imageUpload = await uploadToCloudinary(req.file, "governing-members");

    const newMember = new Governing({
      name,
      position,
      image: imageUpload.secure_url,
      imagePublicId: imageUpload.public_id,
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE member
exports.update = async (req, res) => {
  try {
    const { name, position } = req.body;
    const member = await Governing.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    // Update text fields
    if (name) member.name = name;
    if (position) member.position = position;

    // Update image only if a new file is uploaded
    if (req.file) {
      if (member.imagePublicId) {
        await cloudinary.uploader.destroy(member.imagePublicId, { resource_type: "image" });
      }
      const img = await uploadToCloudinary(req.file, "governing-members");
      member.image = img.secure_url;
      member.imagePublicId = img.public_id;
    }

    await member.save();
    res.json(member);
  } catch (err) {
    console.error("UPDATE GOVERNING MEMBER ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};



// DELETE member
exports.delete = async (req, res) => {
  try {
    const member = await Governing.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    if (member.imagePublicId) {
      await cloudinary.uploader.destroy(member.imagePublicId, { resource_type: "image" });
    }

    await member.deleteOne();
    res.json({ message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
