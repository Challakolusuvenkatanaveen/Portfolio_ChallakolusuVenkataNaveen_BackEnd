const express    = require("express");
const router     = express.Router();
const ctrl       = require("../controllers/experienceController");

router.get("/",      ctrl.getExperiences);
router.post("/",     ctrl.createExperience);
router.delete("/:id",ctrl.deleteExperience);

module.exports = router;
