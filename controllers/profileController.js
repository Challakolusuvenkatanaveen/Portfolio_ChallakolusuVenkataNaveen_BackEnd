const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const profile = await User.findOne().select("-password");
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /profile/:id  — update by explicit ID (used by some routes)
exports.updateProfile = async (req, res) => {
  try {
    const profile = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /profile  — update by finding the first (only) user; no ID needed in URL
exports.updateProfileDirect = async (req, res) => {
  try {
    const existing = await User.findOne();
    if (!existing) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const profile = await User.findByIdAndUpdate(
      existing._id,
      req.body,
      { new: true }
    ).select("-password");
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
