const express = require("express");
const router = express.Router();
const recognitionController = require("../controllers/recognitionController");

router.get("/",      recognitionController.getRecognitions);
router.post("/",     recognitionController.createRecognition);
router.put("/:id",   recognitionController.updateRecognition);
router.delete("/:id",recognitionController.deleteRecognition);

module.exports = router;
