const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  companyName:  { type: String, required: true },
  designation:  { type: String, required: true },
  location:     { type: String },
  startDate:    { type: String },
  endDate:      { type: String },
  description:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Experience", experienceSchema);
