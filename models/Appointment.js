// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Parent / Guardian Info
  parentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "Not Provided" },

  // Child Info
  childName: { type: String, default: "" },
  childAge: { type: Number, min: 1, max: 18, default: null },

  // Appointment Info
  preferredDate: { type: Date, default: null },
  preferredTime: { type: String, default: "" },
  message: { type: String, default: "" },
  subject: { type: String, default: "Appointment Request" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
