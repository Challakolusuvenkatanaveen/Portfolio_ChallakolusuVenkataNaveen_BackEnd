const User = require("../models/User");
const ApprovalRequest = require("../models/ApprovalRequest");
const { notifyApproved, notifyRejected } = require("../services/emailService");

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ["admin", "pending_admin"] },
    }).select("-password").sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || !["admin", "pending_admin"].includes(admin.role)) {
      return res.status(400).json({ message: "Invalid admin" });
    }
    admin.status = admin.status === "blocked" ? "active" : "blocked";
    admin.blockedBy = admin.status === "blocked" ? req.user.id : undefined;
    await admin.save();
    res.json({ success: true, status: admin.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || !["admin", "pending_admin"].includes(admin.role)) {
      return res.status(400).json({ message: "Invalid admin" });
    }
    await ApprovalRequest.deleteOne({ adminId: admin._id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const admin = await User.findById(req.params.id);
    if (!admin || !["admin", "pending_admin"].includes(admin.role)) {
      return res.status(400).json({ message: "Invalid admin" });
    }
    admin.permissions = permissions || [];
    await admin.save();
    res.json({ success: true, permissions: admin.permissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovalInbox = async (req, res) => {
  try {
    const pending = await ApprovalRequest.find({
      status: "pending",
      $or: [
        { assignedTo: req.user.id },
        { assignedTo: { $exists: false } },
      ],
    }).populate("adminId", "fullName email createdAt").sort({ createdAt: -1 });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovalOutbox = async (req, res) => {
  try {
    const resolved = await ApprovalRequest.find({
      status: { $in: ["approved", "rejected"] },
      $or: [
        { approvedBy: req.user.id },
      ],
    }).populate("adminId", "fullName email createdAt").sort({ updatedAt: -1 });
    res.json(resolved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveAdmin = async (req, res) => {
  try {
    const approval = await ApprovalRequest.findOne({ adminId: req.params.id, status: "pending" });
    if (!approval) return res.status(400).json({ message: "No pending approval found" });

    approval.status = "approved";
    approval.approvedBy = req.user.id;
    approval.approvedAt = new Date();
    await approval.save();

    const user = await User.findById(req.params.id);
    user.role = "admin";
    user.status = "active";
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save();

    notifyApproved({ name: user.fullName, email: user.email });

    res.json({ success: true, message: "Admin approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectAdmin = async (req, res) => {
  try {
    const approval = await ApprovalRequest.findOne({ adminId: req.params.id, status: "pending" });
    if (!approval) return res.status(400).json({ message: "No pending approval found" });

    approval.status = "rejected";
    approval.approvedBy = req.user.id;
    approval.rejectedAt = new Date();
    await approval.save();

    const user = await User.findById(req.params.id);
    if (user) {
      user.status = "blocked";
      await user.save();
      notifyRejected({ name: user.fullName, email: user.email });
    }

    res.json({ success: true, message: "Admin rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignApproval = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const approval = await ApprovalRequest.findOne({ adminId: req.params.id, status: "pending" });
    if (!approval) return res.status(400).json({ message: "No pending approval found" });

    approval.assignedTo = assignedTo || undefined;
    await approval.save();

    await User.findByIdAndUpdate(req.params.id, { approvalAssignedTo: assignedTo || undefined });

    res.json({ success: true, message: assignedTo ? "Approval assigned" : "Approval unassigned" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
