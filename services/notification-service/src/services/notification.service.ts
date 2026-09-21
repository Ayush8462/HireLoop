import { INotification, Notification, NotificationDocument, NotificationType } from "../models/notification.model.js";
import { emitToUser } from "../config/socket.js";

export interface CreateNotificationPayload {
  recipientAuthUserId: string;
  senderAuthUserId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Create a notification in the DB and immediately push it via Socket.io
   * if the recipient is currently connected.
   */
  async createAndEmit(payload: CreateNotificationPayload): Promise<NotificationDocument> {
    const notification = await Notification.create({
      recipientAuthUserId: payload.recipientAuthUserId,
      senderAuthUserId: payload.senderAuthUserId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data ?? {},
      isRead: false,
    });

    // Real-time push (no-op if user is offline — they'll see it on next load)
    emitToUser(payload.recipientAuthUserId, "notification:new", {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  /**
   * Get all notifications for a user, newest first.
   */
  async getMyNotifications(
    authUserId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: NotificationDocument[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipientAuthUserId: authUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientAuthUserId: authUserId }),
      Notification.countDocuments({ recipientAuthUserId: authUserId, isRead: false }),
    ]);

    return { notifications: notifications as NotificationDocument[], total, unreadCount };
  }

  /**
   * Get unread count only (used to refresh badge count).
   */
  async getUnreadCount(authUserId: string): Promise<number> {
    return Notification.countDocuments({
      recipientAuthUserId: authUserId,
      isRead: false,
    });
  }

  /**
   * Mark a single notification as read. Validates ownership.
   */
  async markAsRead(authUserId: string, notificationId: string): Promise<NotificationDocument | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientAuthUserId: authUserId },
      { isRead: true },
      { new: true },
    );
  }

  /**
   * Mark all of a user's notifications as read.
   */
  async markAllRead(authUserId: string): Promise<{ modifiedCount: number }> {
    const result = await Notification.updateMany(
      { recipientAuthUserId: authUserId, isRead: false },
      { isRead: true },
    );
    return { modifiedCount: result.modifiedCount };
  }
}

export const notificationService = new NotificationService();
