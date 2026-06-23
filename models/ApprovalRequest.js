const mongoose = require("mongoose");

const approvalRequestSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectedAt: Date,
  approvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("ApprovalRequest", approvalRequestSchema);
