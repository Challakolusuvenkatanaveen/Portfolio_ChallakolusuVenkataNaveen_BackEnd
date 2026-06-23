const Contact = require("../models/Contact");

// Try to load mail transporter — gracefully skip if not configured
let transporter = null;
try {
  transporter = require("../services/mailService");
} catch (_) { /* mail service unavailable — contact saves to DB only */ }

exports.createContact = async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;

    // Always save to DB
    const contact = await Contact.create({ name, email, mobile, message });

    // Optionally send notification email — non-blocking
    if (transporter && process.env.MAIL_USER) {
      transporter.sendMail({
        from: process.env.MAIL_USER,
        to:   process.env.MAIL_USER,
        subject: "New Portfolio Contact",
        html: `<h2>New Contact</h2>
               <p><b>Name:</b> ${name}</p>
               <p><b>Email:</b> ${email}</p>
               <p><b>Mobile:</b> ${mobile || "—"}</p>
               <p><b>Message:</b> ${message}</p>`,
      }).catch((err) => console.warn("Mail send failed (non-fatal):", err.message));
    }

    res.status(201).json({ success: true, message: "Message sent successfully", data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
