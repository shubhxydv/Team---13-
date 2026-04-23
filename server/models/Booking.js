const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    serviceCategory: { type: String, required: true },
    subcategory: { type: String, default: "" },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    hours: { type: Number, default: 1 },
    address: { type: String, required: true },
    instructions: { type: String, default: "" },
    amount: { type: Number, required: true },
    pricePerHour: { type: Number, default: 299 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "cash", ""],
      default: "",
    },
    paidAt: { type: Date, default: null },
    reviewRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    reviewFeedback: { type: String, default: "", trim: true, maxlength: 1000 },
    reviewedAt: { type: Date, default: null },

    // Razorpay fields
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
