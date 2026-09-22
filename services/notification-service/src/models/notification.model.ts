import { HydratedDocument, Model, Schema, model } from "mongoose";

export enum NotificationType {
  REFERRAL_REQUEST = "REFERRAL_REQUEST",
  REFERRAL_ACCEPTED = "REFERRAL_ACCEPTED",
  REFERRAL_REJECTED = "REFERRAL_REJECTED",
  REFERRAL_SUBMITTED = "REFERRAL_SUBMITTED",
  REFERRAL_CANCELLED = "REFERRAL_CANCELLED",
  INTERVIEW_CONFIRMED = "INTERVIEW_CONFIRMED",
  SLOT_CREATED = "SLOT_CREATED",
}

export interface INotification {
  recipientAuthUserId: string;
  senderAuthUserId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipientAuthUserId: {
      type: String,
      required: true,
      index: true,
    },

    senderAuthUserId: {
      type: String,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    data: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound index for fetching a user's notifications sorted by newest first
notificationSchema.index({ recipientAuthUserId: 1, createdAt: -1 });
notificationSchema.index({ recipientAuthUserId: 1, isRead: 1 });

export const Notification: Model<INotification> = model<INotification>(
  "Notification",
  notificationSchema,
);
