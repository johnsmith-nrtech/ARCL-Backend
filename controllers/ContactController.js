const Contact = require('../models/Contact');
const fs = require('fs').promises;
const path = require('path');
const { Resend } = require('resend'); // <-- FIXED import

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

exports.submitContactForm = async (req, res) => {
  try {
    let { name, email, phone = "Not Provided", subject, message } = req.body;

    if (!subject || subject.trim() === "") {
      subject = "Website Contact Form";
    }

    await Contact.create({ name, email, phone, subject, message });

    const templatePath = path.join(__dirname, '../templates/contact-notification.html');
    let htmlContent = await fs.readFile(templatePath, 'utf8');

    const now = new Date();
    htmlContent = htmlContent
      .replace(/{{name}}/g, name)
      .replace(/{{email}}/g, email)
      .replace(/{{phone}}/g, phone)
      .replace(/{{subject}}/g, subject)
      .replace(/{{message}}/g, message.replace(/\n/g, '<br>'))
      .replace(/{{date}}/g, now.toLocaleDateString())
      .replace(/{{time}}/g, now.toLocaleTimeString());

    const response = await resend.emails.send({
      from: `Website Contact Form <${process.env.RESEND_FROM_EMAIL}>`,
      to: process.env.RESEND_TO_EMAIL,
      subject: `New Message: ${subject}`,
      html: htmlContent,
      reply_to: email,
    });

    console.log("Resend Response:", response);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Email sending failed",
      error: error.message,
    });
  }
};
