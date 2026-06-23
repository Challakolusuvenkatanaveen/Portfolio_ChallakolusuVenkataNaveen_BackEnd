const express = require("express");
const router = express.Router();
const { uploadProfile, uploadCertificate } = require("../middlewares/upload");

router.post(
  "/profile",
  uploadProfile.single("profileImage"),
  async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        imageUrl: req.file.path, // Cloudinary URL
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/certificate",
  uploadCertificate.single("certificate"),
  async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        certificateUrl: req.file.path, // Cloudinary URL
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;