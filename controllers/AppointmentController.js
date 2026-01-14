// controllers/AppointmentController.js
const Appointment = require('../models/Appointment');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

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

    // Set default subject if missing
    if (!subject || subject.trim() === "") {
      subject = "Appointment Request";
    }

    // Sanitize numeric/date fields
    const sanitizedChildAge = isNaN(Number(childAge)) ? null : Number(childAge);
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
      .replace(/{{childAge}}/g, sanitizedChildAge ?? "N/A")
      .replace(/{{preferredDate}}/g, sanitizedDate ? sanitizedDate.toLocaleDateString() : "N/A")
      .replace(/{{preferredTime}}/g, preferredTime || "N/A")
      .replace(/{{message}}/g, message.replace(/\n/g, '<br>'))
      .replace(/{{date}}/g, now.toLocaleDateString())
      .replace(/{{time}}/g, now.toLocaleTimeString());

    // 3️⃣ SMTP Transporter (same as ContactController)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify SMTP
    await transporter.verify();

    // 4️⃣ Send Email
    await transporter.sendMail({
      from: `"Appointment Request" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, 
      replyTo: email,
      subject: `New Message: ${subject}`,
      html: htmlContent,
    });

    // 5️⃣ Return success
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
