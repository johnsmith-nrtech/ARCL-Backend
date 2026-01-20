// controllers/AppointmentController.js
const Appointment = require('../models/Appointment');
const fs = require('fs').promises;
const path = require('path');
const { Resend } = require('resend'); // ✅ Correct import

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

exports.submitAppointmentForm = async (req, res) => {
  try {
    let {
      parentName,
      email,
      phone = "Not Provided",
      childName = "",
      childAge,
      preferredDate,
      preferredTime = "",
      message = "",
      subject,
    } = req.body;

    // Default subject
    if (!subject || subject.trim() === "") {
      subject = "Appointment Request";
    }

    // Sanitize numeric/date fields
    const sanitizedChildAge = isNaN(Number(childAge)) ? "N/A" : Number(childAge);
    const sanitizedDate = preferredDate && preferredDate !== "N/A" ? new Date(preferredDate) : null;

    // 1️⃣ Save to MongoDB
    await Appointment.create({
      parentName,
      email,
      phone,
      childName,
      childAge: sanitizedChildAge,
      preferredDate: sanitizedDate,
      preferredTime,
      message,
      subject,
    });

    // 2️⃣ Load Email Template
    const templatePath = path.join(__dirname, '../templates/appointment-notification.html');
    let htmlContent = await fs.readFile(templatePath, 'utf8');

    const now = new Date();
    htmlContent = htmlContent
      .replace(/{{parentName}}/g, parentName || "N/A")
      .replace(/{{email}}/g, email || "N/A")
      .replace(/{{phone}}/g, phone || "N/A")
      .replace(/{{childName}}/g, childName || "N/A")
      .replace(/{{childAge}}/g, sanitizedChildAge)
      .replace(/{{preferredDate}}/g, sanitizedDate ? sanitizedDate.toLocaleDateString() : "N/A")
      .replace(/{{preferredTime}}/g, preferredTime || "N/A")
      .replace(/{{message}}/g, message.replace(/\n/g, '<br>'))
      .replace(/{{date}}/g, now.toLocaleDateString())
      .replace(/{{time}}/g, now.toLocaleTimeString());

    // 3️⃣ Send Email via Resend
    const response = await resend.emails.send({
      from: `Appointment Form <${process.env.RESEND_FROM_EMAIL}>`,
      to: process.env.RESEND_TO_EMAIL, // Admin email
      subject: `New Appointment Request: ${subject}`,
      html: htmlContent,
      reply_to: email, // so admin can reply directly
    });

    console.log("Resend Response:", response);

    // 4️⃣ Return success
    return res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
    });

  } catch (error) {
    console.error("APPOINTMENT EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send appointment request",
      error: error.message,
    });
  }
};
