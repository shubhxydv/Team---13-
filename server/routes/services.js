const express = require("express");
const router = express.Router();
const ServiceProvider = require("../models/ServiceProvider");

const CATEGORY_MAP = {
  cleaning: "Cleaning",
  plumbing: "Plumbing",
  electrical: "Electrical",
  carpentry: "Carpentry",
  painting: "Painting",
  appliance_repair: "Appliance Repair",
  ac_repair: "Appliance Repair",
  pest_control: "Pest Control",
  gardening: "Gardening",
  security: "Security",
  interior_design: "Other",
  locksmith: "Other",
  other: "Other",
};

const getSort = (sort) => {
  if (sort === "rating") return { rating: -1, createdAt: -1 };
  if (sort === "experience") return { experience: -1, createdAt: -1 };
  if (sort === "reviews") return { totalReviews: -1, createdAt: -1 };
  return { createdAt: -1 };
};

router.get("/providers/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { sort = "createdAt", minRating, city } = req.query;

    const mappedCategory = CATEGORY_MAP[category] || category;

    const filter = {
      isVerified: true,
      verificationStatus: "approved",
      isActive: true,
      serviceCategory: mappedCategory,
    };

    if (minRating) {
      filter.rating = { $gte: Number(minRating) || 0 };
    }

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    const providers = await ServiceProvider.find(filter)
      .select("-password")
      .sort(getSort(sort));

    return res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/provider/:id", async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({
      _id: req.params.id,
      isVerified: true,
      verificationStatus: "approved",
      isActive: true,
    }).select("-password");

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    return res.status(200).json({ success: true, provider });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
