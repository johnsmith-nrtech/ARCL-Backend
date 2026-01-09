const nodemailer = require("nodemailer");

// POST: /api/appointment
exports.submitAppointment = async (req, res) => {
  try {
    const {
      parentName,
      email,
      phone,
      childName,
      childAge,
      preferredDate,
      preferredTime,
      message,
    } = req.body;

    // Simple validation
    if (!parentName || !email || !phone || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, 
      port: process.env.SMTP_PORT || 465, 
      secure: true, 
      auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS, 
      },
    });

    // Email content
    const mailOptions = {
      from: `"${parentName}" <${email}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL, 
      subject: "New Appointment Request",
      html: `
        <h2>New Appointment Request</h2>
        <p><strong>Parent Name:</strong> ${parentName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Child Name:</strong> ${childName || "-"}</p>
        <p><strong>Child Age:</strong> ${childAge || "-"}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime}</p>
        <p><strong>Message:</strong> ${message || "-"}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Appointment request sent successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong while sending the email." });
  }
};
