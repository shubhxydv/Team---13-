const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    roll: { type: String, required: true, trim: true },
    year: { type: String, required: true },
    degree: { type: String, required: true },
    project: { type: String, default: "" },
    hobbies: { type: String, default: "" },
    certificate: { type: String, default: "" },
    internship: { type: String, default: "" },
    aim: { type: String, default: "" },
    email: { type: String, default: "" },
    image: { type: String, default: "" },  // filename stored here
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);