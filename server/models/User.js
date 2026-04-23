const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true, minlength: 6 },

    phone: { type: String, default: "" },

    address: { type: String, default: "" },

    role: { type: String, default: "user" },

    isActive: { type: Boolean, default: true },

    // 🔐 EMAIL VERIFICATION FIELDS
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },

    // 🚨 ADMIN CONTROLS
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null }
  },
  { timestamps: true }
);

// 🔑 Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);