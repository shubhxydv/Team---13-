const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const { protect, isUser } = require("../middleware/Auth");

// ── Initialize Razorpay ──────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create Razorpay Order ────────────────────────────────────
// POST /api/payment/create-order
router.post("/create-order", protect, isUser, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "This booking is already paid" });
    }

    // Amount in paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(booking.amount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${bookingId.slice(-8)}`,
      notes: {
        bookingId: bookingId,
        userId: String(req.user._id),
        serviceCategory: booking.serviceCategory,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order ID on the booking for verification later
    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── Verify Razorpay Payment ──────────────────────────────────
// POST /api/payment/verify
router.post("/verify", protect, isUser, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      paymentMethod,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed — invalid signature" });
    }

    // Update booking with payment details
    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "paid";
    booking.paymentMethod = paymentMethod || "card";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("provider", "name city phone serviceCategory experience rating totalReviews");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      booking: populated,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── Cash on Delivery — mark booking as 'cash' ────────────────
// POST /api/payment/cash
router.post("/cash", protect, isUser, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.paymentMethod = "cash";
    booking.paymentStatus = "pending"; // Will be paid on service
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("provider", "name city phone serviceCategory experience rating totalReviews");

    return res.status(200).json({
      success: true,
      message: "Cash on service selected",
      booking: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
