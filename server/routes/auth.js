const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");
const Admin = require("../models/Admin");
const { protect, isAdmin } = require("../middleware/Auth");
const { sendOtpEmail } = require("../config/mailer");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const isEmailTaken = async (email) => {
  const [user, provider, admin] = await Promise.all([
    User.findOne({ email, isEmailVerified: true }),
    ServiceProvider.findOne({ email, isEmailVerified: true }),
    Admin.findOne({ email }),
  ]);
  return user || provider || admin;
};

// Generate a 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ── Signup: User (Step 1 — send OTP) ─────────────────────
router.post("/signup/user", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email and password are required" });

    if (await isEmailTaken(email))
      return res.status(400).json({ success: false, message: "Email already registered" });

    // Remove any previous unverified attempt with same email
    await User.deleteMany({ email, isEmailVerified: false });

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with unverified status
    await User.create({
      name, email, password, phone,
      otp, otpExpiresAt,
      isEmailVerified: false,
    });

    // Send OTP email
    await sendOtpEmail(email, otp, "User");

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      email,
      role: "user",
    });
  } catch (error) {
    console.error("Signup User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Signup: Service Provider (Step 1 — send OTP) ─────────
router.post("/signup/provider", async (req, res) => {
  try {
    const { name, email, password, phone, serviceCategory, serviceDescription, address, city, experience } = req.body;

    if (!name || !email || !password || !phone || !serviceCategory || !address || !city)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (await isEmailTaken(email))
      return res.status(400).json({ success: false, message: "Email already registered" });

    // Remove any previous unverified attempt with same email
    await ServiceProvider.deleteMany({ email, isEmailVerified: false });

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await ServiceProvider.create({
      name, email, password, phone,
      serviceCategory, serviceDescription,
      address, city, experience: experience || 0,
      otp, otpExpiresAt,
      isEmailVerified: false,
    });

    await sendOtpEmail(email, otp, "Service Provider");

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      email,
      role: "serviceProvider",
    });
  } catch (error) {
    console.error("Signup Provider Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Verify OTP (Step 2 — complete registration) ──────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role)
      return res.status(400).json({ success: false, message: "Email, OTP and role are required" });

    let account = null;

    if (role === "user") {
      account = await User.findOne({ email, isEmailVerified: false });
    } else if (role === "serviceProvider") {
      account = await ServiceProvider.findOne({ email, isEmailVerified: false });
    }

    if (!account)
      return res.status(404).json({ success: false, message: "No pending verification found for this email" });

    // Check OTP expiry
    if (account.otpExpiresAt < new Date())
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });

    // Check OTP match
    if (account.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });

    // Mark as verified
    account.isEmailVerified = true;
    account.otp = null;
    account.otpExpiresAt = null;
    await account.save({ validateBeforeSave: false });

    // Generate token and log them in
    const token = generateToken(account._id, role);

    const responseUser = { id: account._id, name: account.name, email: account.email, role };
    if (role === "serviceProvider") {
      responseUser.phone = account.phone;
      responseUser.address = account.address;
      responseUser.city = account.city;
      responseUser.serviceCategory = account.serviceCategory;
      responseUser.isVerified = account.isVerified;
      responseUser.verificationStatus = account.verificationStatus;
      responseUser.rejectionReason = account.rejectionReason;
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Account created.",
      token,
      user: responseUser,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Resend OTP ───────────────────────────────────────────
router.post("/resend-otp", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role)
      return res.status(400).json({ success: false, message: "Email and role are required" });

    let account = null;

    if (role === "user") {
      account = await User.findOne({ email, isEmailVerified: false });
    } else if (role === "serviceProvider") {
      account = await ServiceProvider.findOne({ email, isEmailVerified: false });
    }

    if (!account)
      return res.status(404).json({ success: false, message: "No pending verification found for this email" });

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    account.otp = otp;
    account.otpExpiresAt = otpExpiresAt;
    await account.save({ validateBeforeSave: false });

    const roleLabel = role === "serviceProvider" ? "Service Provider" : "User";
    await sendOtpEmail(email, otp, roleLabel);

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Signup: Admin ─────────────────────────────────────────
router.post("/signup/admin", async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    if (!name || !email || !password || !adminKey)
      return res.status(400).json({ success: false, message: "All fields including admin key are required" });

    if (adminKey !== process.env.ADMIN_SECRET_KEY)
      return res.status(403).json({ success: false, message: "Invalid admin key" });

    if (await isEmailTaken(email))
      return res.status(400).json({ success: false, message: "Email already registered" });

    const admin = await Admin.create({ name, email, password });
    const token = generateToken(admin._id, "admin");

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Login (all roles) ─────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    let account = null;
    let role = null;

    const [user, provider, admin] = await Promise.all([
      User.findOne({ email }),
      ServiceProvider.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (user) { account = user; role = "user"; }
    else if (provider) { account = provider; role = "serviceProvider"; }
    else if (admin) { account = admin; role = "admin"; }

    if (!account)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    // Block unverified email accounts (User / ServiceProvider)
    if (role !== "admin" && !account.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in. Check your inbox for the OTP.",
        needsVerification: true,
        email: account.email,
        role,
      });
    }

    if (!account.isActive)
      return res.status(403).json({ success: false, message: "Your account has been deactivated" });

    const isMatch = await account.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (role === "admin") {
      account.lastLogin = new Date();
      await account.save({ validateBeforeSave: false });
    }

    const token = generateToken(account._id, role);

    const responseUser = { id: account._id, name: account.name, email: account.email, role };
    if (role === "serviceProvider") {
      responseUser.phone = account.phone;
      responseUser.address = account.address;
      responseUser.city = account.city;
      responseUser.serviceCategory = account.serviceCategory;
      responseUser.isVerified = account.isVerified;
      responseUser.verificationStatus = account.verificationStatus;
      responseUser.rejectionReason = account.rejectionReason;
    }

    res.status(200).json({ success: true, message: "Login successful", token, user: responseUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Get current user ──────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// ── Update current user profile ──────────────────────────
router.put("/update-profile", protect, async (req, res) => {
  try {
    if (req.userRole !== "user") {
      return res.status(403).json({ success: false, message: "Only users can update this profile" });
    }

    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (typeof phone === "string") user.phone = phone.trim();
    if (typeof address === "string") user.address = address.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: verify or reject provider ─────────────────────
router.put("/admin/verify-provider/:id", protect, isAdmin, async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;

    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ success: false, message: "Action must be approve or reject" });

    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    if (action === "approve") {
      provider.isVerified = true;
      provider.verificationStatus = "approved";
      provider.verifiedBy = req.user._id;
      provider.verifiedAt = new Date();
    } else {
      provider.isVerified = false;
      provider.verificationStatus = "rejected";
      provider.rejectionReason = rejectionReason || "Not specified";
    }

    await provider.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: `Provider ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: get all pending providers ─────────────────────
router.get("/admin/pending-providers", protect, isAdmin, async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ verificationStatus: "pending", isEmailVerified: true })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: providers.length, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: get providers by status ──────────────────────
router.get("/admin/providers-by-status", protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be pending, approved, or rejected" });
    }

    const providers = await ServiceProvider.find({ verificationStatus: status, isEmailVerified: true })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: providers.length, providers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: provider analytics ────────────────────────────
router.get("/admin/provider-analytics", protect, isAdmin, async (req, res) => {
  try {
    const [totalProviders, pending, verified, rejected] = await Promise.all([
      ServiceProvider.countDocuments({ isEmailVerified: true }),
      ServiceProvider.countDocuments({ verificationStatus: "pending", isEmailVerified: true }),
      ServiceProvider.countDocuments({ verificationStatus: "approved", isEmailVerified: true }),
      ServiceProvider.countDocuments({ verificationStatus: "rejected", isEmailVerified: true }),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalProviders,
        pending,
        verified,
        rejected,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
// ── Admin: get all users ──────────────────────────────────
router.get("/admin/users", protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status === "active") query = { isBanned: false, isActive: true };
    else if (status === "banned") query = { isBanned: true };

    const users = await User.find(query)
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: user analytics ─────────────────────────────────
router.get("/admin/user-analytics", protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false, isActive: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Users registered this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        bannedUsers,
        newThisMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: handle user action (ban/unban) ─────────────────
router.put("/admin/users/:userId/action", protect, isAdmin, async (req, res) => {
  try {
    const { action, reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (action === "ban") {
      user.isBanned = true;
      user.banReason = reason || "No reason provided";
    } else if (action === "unban") {
      user.isBanned = false;
      user.banReason = null;
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: `User ${action}ned successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: delete user ────────────────────────────────────
router.delete("/admin/users/:userId", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin: delete provider ────────────────────────────────
router.delete("/admin/providers/:id", protect, isAdmin, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

    res.status(200).json({ success: true, message: "Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;