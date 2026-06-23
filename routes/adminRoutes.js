const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const { superAdminOnly } = require("../middlewares/roleMiddleware");

router.get("/admins", authMiddleware, superAdminOnly, adminController.getAllAdmins);
router.put("/admins/:id/block", authMiddleware, superAdminOnly, adminController.blockAdmin);
router.delete("/admins/:id", authMiddleware, superAdminOnly, adminController.deleteAdmin);
router.put("/admins/:id/permissions", authMiddleware, superAdminOnly, adminController.updatePermissions);

router.get("/approval/inbox", authMiddleware, adminController.getApprovalInbox);
router.get("/approval/outbox", authMiddleware, adminController.getApprovalOutbox);
router.put("/approval/:id/approve", authMiddleware, adminController.approveAdmin);
router.put("/approval/:id/reject", authMiddleware, adminController.rejectAdmin);
router.put("/approval/:id/assign", authMiddleware, adminController.assignApproval);

module.exports = router;
