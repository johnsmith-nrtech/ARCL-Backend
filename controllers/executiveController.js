const Executive = require("../models/ExecutiveMember");
const cloudinary = require("../config/cloudinary");

// helper
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

// GET all
exports.getAll = async (req, res) => {
  try {
    const members = await Executive.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET by ID
exports.getById = async (req, res) => {
  try {
    const member = await Executive.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, position } = req.body;
    if (!name || !position || !req.file)
      return res.status(400).json({ error: "Name, position & image required" });

    const imageUpload = await uploadToCloudinary(req.file, "executive-members");

    const member = await Executive.create({
      name,
      position,
      image: imageUpload.secure_url,
      imagePublicId: imageUpload.public_id,
    });

    res.status(201).json(member);
  } catch (err) {
    console.error("CREATE EXECUTIVE ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const member = await Executive.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    // Update text fields
    if (req.body.name) member.name = req.body.name;
    if (req.body.position) member.position = req.body.position;

    // Update image only if a new file is uploaded
    if (req.file) {
      if (member.imagePublicId) {
        await cloudinary.uploader.destroy(member.imagePublicId, { resource_type: "image" });
      }

      const img = await uploadToCloudinary(req.file, "executive-members");
      member.image = img.secure_url;
      member.imagePublicId = img.public_id;
    }

    await member.save();
    res.json(member);
  } catch (err) {
    console.error("UPDATE EXECUTIVE ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const member = await Executive.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    if (member.imagePublicId) {
      await cloudinary.uploader.destroy(member.imagePublicId);
    }

    await member.deleteOne();
    res.json({ message: "Member deleted" });
  } catch (err) {
    console.error("DELETE EXECUTIVE ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};
