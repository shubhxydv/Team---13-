const express = require("express");
const ContactQuery = require("../models/ContactQuery");
const { protect, isAdmin } = require("../middleware/Auth");
const {
  sendContactConfirmationEmail,
  sendContactNotificationEmail,
} = require("../config/contactMailer");

const router = express.Router();

router.get("/admin/list", protect, isAdmin, async (req, res) => {
  try {
    const queries = await ContactQuery.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: queries.length,
      queries,
    });
  } catch (error) {
    console.error("Fetch contact queries error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch contact queries right now",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const query = req.body.query?.trim();

    if (!name || !email || !query) {
      return res.status(400).json({
        success: false,
        message: "Name, email and query are required",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const savedQuery = await ContactQuery.create({ name, email, query });

    let emailSent = true;

    try {
      await Promise.all([
        sendContactConfirmationEmail({ toEmail: email, name, query }),
        sendContactNotificationEmail({ name, email, query }),
      ]);
    } catch (mailError) {
      emailSent = false;
      console.error("Contact confirmation email error:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Your query has been sent successfully"
        : "Your query was saved, but the confirmation email could not be sent right now",
      emailSent,
      contactQuery: savedQuery,
    });
  } catch (error) {
    console.error("Contact query error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send your query right now",
    });
  }
});

module.exports = router;
