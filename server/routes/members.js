const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Member = require("../models/Member");

// ── Multer config ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

// ── POST /api/members ──────────────────────────────────────
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, roll, year, degree, project, hobbies, certificate, internship, aim, email } = req.body;

    if (!name || !roll || !year || !degree) {
      return res.status(400).json({ success: false, message: "Name, roll, year and degree are required" });
    }

    const member = await Member.create({
      name, roll, year, degree, project, hobbies, certificate, internship, aim, email,
      image: req.file ? req.file.filename : "",
    });

    res.status(201).json({ success: true, data: member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/members ───────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/members/:id ───────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;