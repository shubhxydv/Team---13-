const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const ServiceProvider = require("../models/ServiceProvider");
const { protect, isUser, isVerifiedProvider } = require("../middleware/Auth");

const refreshProviderReviewSummary = async (providerId) => {
  const summary = await Booking.aggregate([
    {
      $match: {
        provider: providerId,
        reviewRating: { $ne: null },
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$provider",
        averageRating: { $avg: "$reviewRating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = summary[0]?.averageRating || 0;
  const totalReviews = summary[0]?.totalReviews || 0;

  await ServiceProvider.findByIdAndUpdate(providerId, {
    rating: Number(averageRating.toFixed(1)),
    totalReviews,
  });
};

router.post("/", protect, isUser, async (req, res) => {
  try {
    const {
      providerId,
      serviceCategory,
      subcategory,
      date,
      timeSlot,
      address,
      instructions,
      amount,
      hours,
      pricePerHour,
    } = req.body;

    if (!providerId || !serviceCategory || !date || !timeSlot || !address || !amount) {
      return res.status(400).json({ success: false, message: "Missing required booking fields" });
    }

    const provider = await ServiceProvider.findOne({
      _id: providerId,
      isVerified: true,
      verificationStatus: "approved",
      isActive: true,
    });

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not available for booking" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      provider: provider._id,
      serviceCategory,
      subcategory: subcategory || "",
      date,
      timeSlot,
      hours: Number(hours) || 1,
      address,
      instructions: instructions || "",
      amount: Number(amount),
      pricePerHour: Number(pricePerHour) || 299,
    });

    const populated = await Booking.findById(booking._id)
      .populate("provider", "name city phone serviceCategory experience rating totalReviews");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/my-bookings", protect, isUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("provider", "name company city phone serviceCategory rating totalReviews")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/provider-bookings/list", protect, isVerifiedProvider, async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/status", protect, isVerifiedProvider, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, provider: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot change status from ${booking.status} to ${status}` });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({ success: true, message: "Booking status updated", booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/payment", protect, isUser, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (!["upi", "card", "cash"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();

    await booking.save();

    return res.status(200).json({ success: true, message: "Payment updated", booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/review", protect, isUser, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate("provider", "name city phone serviceCategory experience rating totalReviews")
      .populate("user", "name email phone address");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "You can rate only completed services" });
    }

    if (booking.reviewRating) {
      return res.status(400).json({ success: false, message: "This booking has already been reviewed" });
    }

    booking.reviewRating = numericRating;
    booking.reviewFeedback = String(feedback || "").trim();
    booking.reviewedAt = new Date();
    await booking.save();

    await refreshProviderReviewSummary(booking.provider._id);

    const updatedBooking = await Booking.findById(booking._id)
      .populate("provider", "name city phone serviceCategory experience rating totalReviews")
      .populate("user", "name email phone address");

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("provider", "name city phone serviceCategory experience rating totalReviews")
      .populate("user", "name email phone address");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isOwnerUser = req.userRole === "user" && String(booking.user?._id) === String(req.user._id);
    const isOwnerProvider = req.userRole === "serviceProvider" && String(booking.provider?._id) === String(req.user._id);
    const isAdmin = req.userRole === "admin";

    if (!isOwnerUser && !isOwnerProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin/User: delete booking ────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isOwnerUser = req.userRole === "user" && String(booking.user) === String(req.user._id);
    const isOwnerProvider = req.userRole === "serviceProvider" && String(booking.provider) === String(req.user._id);
    const isAdmin = req.userRole === "admin";

    if (!isOwnerUser && !isOwnerProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const providerId = booking.provider;
    await Booking.findByIdAndDelete(req.params.id);
    if (providerId) {
      await refreshProviderReviewSummary(providerId);
    }
    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
