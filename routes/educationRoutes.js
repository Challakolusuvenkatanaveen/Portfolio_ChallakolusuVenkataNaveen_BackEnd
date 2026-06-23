const express = require("express");
const router = express.Router();
const educationController = require("../controllers/educationController");

router.get("/",      educationController.getEducations);
router.post("/",     educationController.createEducation);
router.put("/:id",   educationController.updateEducation);
router.delete("/:id",educationController.deleteEducation);

module.exports = router;
