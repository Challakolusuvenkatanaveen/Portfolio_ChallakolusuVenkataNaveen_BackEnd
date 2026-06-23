const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.get("/",     profileController.getProfile);
router.put("/",     profileController.updateProfileDirect);   // <-- FIX: no ID needed
router.put("/:id",  profileController.updateProfile);         // kept for backward compat

module.exports = router;
