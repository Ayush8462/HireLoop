import { RequestHandler } from "express";
import { notificationService } from "../services/notification.service.js";

/**
 * GET /notifications?page=1&limit=20
 * Returns paginated notifications for the authenticated user.
 */
export const getMyNotifications: RequestHandler = async (req, res, next) => {
  try {
    const authUserId = req.user!.authUserId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const result = await notificationService.getMyNotifications(authUserId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /notifications/unread-count
 * Returns unread notification count for badge display.
 */
export const getUnreadCount: RequestHandler = async (req, res, next) => {
  try {
    const authUserId = req.user!.authUserId;
    const count = await notificationService.getUnreadCount(authUserId);

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /notifications/:id/read
 * Marks a single notification as read.
 */
export const markAsRead: RequestHandler = async (req, res, next) => {
  try {
    const authUserId = req.user!.authUserId;
    const id = String(req.params.id);

    const notification = await notificationService.markAsRead(authUserId, id);

    if (!notification) {
      res.status(404).json({
        success: false,
        error: { message: "Notification not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /notifications/read-all
 * Marks all notifications as read for the authenticated user.
 */
export const markAllRead: RequestHandler = async (req, res, next) => {
  try {
    const authUserId = req.user!.authUserId;
    const result = await notificationService.markAllRead(authUserId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
