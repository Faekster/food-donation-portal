import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All notification routes require authentication
router.use(auth);

// Get user notifications
router.get("/", getNotifications);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;
