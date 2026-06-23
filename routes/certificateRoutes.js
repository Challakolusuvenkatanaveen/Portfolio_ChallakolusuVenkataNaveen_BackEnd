const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");

router.get("/",      certificateController.getCertificates);
router.post("/",     certificateController.createCertificate);
router.delete("/:id",certificateController.deleteCertificate);

module.exports = router;
