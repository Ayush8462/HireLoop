import API from "./client.js";

/**
 * Get paginated notifications for the authenticated user.
 */
export const getNotifications = (page = 1, limit = 20) =>
  API.get("/notifications", { params: { page, limit } });

/**
 * Get the unread notification count (for badge).
 */
export const getUnreadCount = () =>
  API.get("/notifications/unread-count");

/**
 * Mark a single notification as read.
 */
export const markAsRead = (id) =>
  API.patch(`/notifications/${id}/read`);

/**
 * Mark all notifications as read.
 */
export const markAllRead = () =>
  API.patch("/notifications/read-all");
