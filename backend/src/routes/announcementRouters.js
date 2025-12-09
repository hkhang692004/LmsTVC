import express from "express";
import NotificationController from "../controllers/notificationController.js";

const router = express.Router();

// === NOTIFICATIONS ===
// GET /api/notifications
router.get("/", NotificationController.getAllNotifications);
router.get("/me", NotificationController.getMyNotifications);
router.post("/", NotificationController.createNotification);
router.put("/:id", NotificationController.updateNotification);
router.delete("/:id", NotificationController.deleteNotification);
export default router;