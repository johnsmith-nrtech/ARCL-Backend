// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Common fields
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "Not Provided" },
  subject: { type: String, default: "" },
  message: { type: String, default: "" },
  formType: { type: String, default: "ContactUs" }, // ContactUs or Appointment
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
