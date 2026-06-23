const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  designation: String,
  about: String,
  mobile: String,
  location: String,
  github: String,
  linkedin: String,
  resumeUrl: String,
  profileImage: String,

  role: {
    type: String,
    enum: ["super_admin", "admin", "pending_admin"],
    default: "pending_admin",
  },
  status: {
    type: String,
    enum: ["active", "blocked", "pending"],
    default: "pending",
  },
  permissions: {
    type: [String],
    default: [],
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  approvalAssignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
