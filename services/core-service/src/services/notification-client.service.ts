import axios from "axios";
import { env } from "../config/env.js";

// Mirror of notification-service NotificationType (kept in sync)
export const NotificationType = {
  REFERRAL_REQUEST: "REFERRAL_REQUEST",
  REFERRAL_ACCEPTED: "REFERRAL_ACCEPTED",
  REFERRAL_REJECTED: "REFERRAL_REJECTED",
  REFERRAL_SUBMITTED: "REFERRAL_SUBMITTED",
  REFERRAL_CANCELLED: "REFERRAL_CANCELLED",
  INTERVIEW_CONFIRMED: "INTERVIEW_CONFIRMED",
  SLOT_CREATED: "SLOT_CREATED",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

const INTERNAL_HEADERS = {
  "x-internal-secret": env.NOTIFICATION_INTERNAL_SECRET,
  "Content-Type": "application/json",
};

/**
 * Fire-and-forget notification calls to the notification-service.
 * Errors are logged but never thrown — they must never break the main request flow.
 */
export const notificationClient = {
  async fireReferralEvent(payload: {
    type: string;
    referralId: string;
    jobTitle: string;
    companyName: string;
    studentAuthUserId: string;
    seniorAuthUserId: string;
    studentName: string;
    seniorName: string;
  }): Promise<void> {
    try {
      await axios.post(
        `${env.NOTIFICATION_SERVICE_URL}/internal/referral-event`,
        payload,
        { headers: INTERNAL_HEADERS, timeout: 5000 },
      );
    } catch (error) {
      console.error("[notification-client] Failed to fire referral event:", error);
    }
  },

  async fireInterviewConfirmed(payload: {
    bookingId: string;
    slotId: string;
    startTime: string;
    endTime: string;
    studentAuthUserId: string;
    seniorAuthUserId: string;
    studentName: string;
    seniorName: string;
    meetLink?: string;
  }): Promise<void> {
    try {
      await axios.post(
        `${env.NOTIFICATION_SERVICE_URL}/internal/interview-confirmed`,
        payload,
        { headers: INTERNAL_HEADERS, timeout: 5000 },
      );
    } catch (error) {
      console.error("[notification-client] Failed to fire interview confirmed event:", error);
    }
  },

  async fireSlotCreated(payload: {
    slotId: string;
    seniorAuthUserId: string;
    seniorName: string;
    startTime: string;
    endTime: string;
    recipientAuthUserIds: string[];
  }): Promise<void> {
    try {
      await axios.post(
        `${env.NOTIFICATION_SERVICE_URL}/internal/slot-created`,
        payload,
        { headers: INTERNAL_HEADERS, timeout: 5000 },
      );
    } catch (error) {
      console.error("[notification-client] Failed to fire slot created event:", error);
    }
  },
};
