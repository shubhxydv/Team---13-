const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const serviceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true, minlength: 6 },

    phone: { type: String, required: true },

    serviceCategory: {
      type: String,
      required: true,
      enum: [
        "Plumbing",
        "Electrical",
        "Cleaning",
        "Carpentry",
        "Painting",
        "Appliance Repair",
        "Pest Control",
        "Gardening",
        "Security",
        "Other",
      ],
    },

    serviceDescription: { type: String, default: "" },

    address: { type: String, required: true },

    city: { type: String, required: true },

    experience: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },

    totalReviews: { type: Number, default: 0 },

    role: { type: String, default: "serviceProvider" },

    // 🔐 EMAIL VERIFICATION (NEW)
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },

    // 🛠 ADMIN VERIFICATION (ALREADY EXISTS)
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔑 HASH PASSWORD
serviceProviderSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 MATCH PASSWORD
serviceProviderSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);