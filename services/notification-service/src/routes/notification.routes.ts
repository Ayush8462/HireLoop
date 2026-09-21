import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from "../controllers/notification.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markAsRead);

export default router;
