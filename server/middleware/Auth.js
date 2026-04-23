const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");
const Admin = require("../models/Admin");

const findUserByRole = async (id, role) => {
  if (role === "user") return await User.findById(id).select("-password");
  if (role === "serviceProvider") return await ServiceProvider.findById(id).select("-password");
  if (role === "admin") return await Admin.findById(id).select("-password");
  return null;
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserByRole(decoded.id, decoded.role);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or deactivated" });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole === "admin") return next();
  return res.status(403).json({ success: false, message: "Access denied: Admins only" });
};

const isVerifiedProvider = (req, res, next) => {
  if (req.userRole === "serviceProvider" && req.user.isVerified) return next();
  if (req.userRole === "serviceProvider" && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Your account is pending admin verification",
      verificationStatus: req.user.verificationStatus,
    });
  }
  return res.status(403).json({ success: false, message: "Access denied: Service Providers only" });
};

const isUser = (req, res, next) => {
  if (req.userRole === "user") return next();
  return res.status(403).json({ success: false, message: "Access denied: Users only" });
};

module.exports = { protect, isAdmin, isVerifiedProvider, isUser };