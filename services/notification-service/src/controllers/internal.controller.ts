import { RequestHandler } from "express";
import axios from "axios";
import { env } from "../config/env.js";
import { notificationService } from "../services/notification.service.js";
import { sendInterviewConfirmationEmail, generateMeetLink } from "../services/email.service.js";
import { NotificationType } from "../models/notification.model.js";

// ─── Helper: fetch user info (email + name) from auth-service ────────────────

interface AuthUserInfo {
  email: string;
  firstName: string;
  lastName: string;
}

async function getUserInfo(authUserId: string): Promise<AuthUserInfo | null> {
  try {
    const response = await axios.get<{ success: boolean; data: AuthUserInfo }>(
      `${env.AUTH_SERVICE_URL}/internal/user-email/${authUserId}`,
      {
        headers: { "x-internal-secret": env.NOTIFICATION_INTERNAL_SECRET },
        timeout: 5000,
      },
    );
    if (response.data.success) return response.data.data;
    return null;
  } catch (error) {
    console.error(`[internal] Failed to fetch user info for ${authUserId}:`, error);
    return null;
  }
}

// ─── Referral Event ───────────────────────────────────────────────────────────

interface ReferralEventPayload {
  type: NotificationType;
  referralId: string;
  jobTitle: string;
  companyName: string;
  studentAuthUserId: string;
  seniorAuthUserId: string;
  studentName: string;
  seniorName: string;
}

/**
 * POST /internal/referral-event
 * Called by core-service when a referral is created or its status changes.
 */
export const handleReferralEvent: RequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as ReferralEventPayload;

    const {
      type,
      referralId,
      jobTitle,
      companyName,
      studentAuthUserId,
      seniorAuthUserId,
      studentName,
      seniorName,
    } = payload;

    let recipientAuthUserId: string;
    let senderAuthUserId: string;
    let title: string;
    let message: string;

    switch (type) {
      case NotificationType.REFERRAL_REQUEST:
        // Student → Senior: notify senior
        recipientAuthUserId = seniorAuthUserId;
        senderAuthUserId = studentAuthUserId;
        title = "📩 New Referral Request";
        message = `${studentName} has requested a referral for "${jobTitle}" at ${companyName}.`;
        break;

      case NotificationType.REFERRAL_ACCEPTED:
        // Senior → Student: notify student
        recipientAuthUserId = studentAuthUserId;
        senderAuthUserId = seniorAuthUserId;
        title = "✅ Referral Request Accepted";
        message = `${seniorName} has accepted your referral request for "${jobTitle}" at ${companyName}.`;
        break;

      case NotificationType.REFERRAL_REJECTED:
        recipientAuthUserId = studentAuthUserId;
        senderAuthUserId = seniorAuthUserId;
        title = "❌ Referral Request Declined";
        message = `${seniorName} has declined your referral request for "${jobTitle}" at ${companyName}.`;
        break;

      case NotificationType.REFERRAL_SUBMITTED:
        recipientAuthUserId = studentAuthUserId;
        senderAuthUserId = seniorAuthUserId;
        title = "📤 Referral Submitted";
        message = `${seniorName} has submitted your referral for "${jobTitle}" at ${companyName}. Good luck!`;
        break;

      case NotificationType.REFERRAL_CANCELLED:
        // Student cancelled → notify senior
        recipientAuthUserId = seniorAuthUserId;
        senderAuthUserId = studentAuthUserId;
        title = "🚫 Referral Request Cancelled";
        message = `${studentName} has cancelled their referral request for "${jobTitle}" at ${companyName}.`;
        break;

      default:
        res.status(400).json({ success: false, error: { message: "Unknown referral event type" } });
        return;
    }

    await notificationService.createAndEmit({
      recipientAuthUserId,
      senderAuthUserId,
      type,
      title,
      message,
      data: { referralId, jobTitle, companyName, studentAuthUserId, seniorAuthUserId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── Interview Confirmed Event ────────────────────────────────────────────────

interface InterviewConfirmedPayload {
  bookingId: string;
  slotId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  studentAuthUserId: string;
  seniorAuthUserId: string;
  studentName: string;
  seniorName: string;
  meetLink?: string;
}

/**
 * POST /internal/interview-confirmed
 * Called by core-service when a student books an interview slot.
 * Creates in-app notifications for both parties and sends emails with a Meet link.
 */
export const handleInterviewConfirmed: RequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as InterviewConfirmedPayload;
    const {
      bookingId,
      slotId,
      startTime,
      endTime,
      studentAuthUserId,
      seniorAuthUserId,
      studentName,
      seniorName,
    } = payload;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const meetLink = payload.meetLink || generateMeetLink();

    // In-app notification for student
    await notificationService.createAndEmit({
      recipientAuthUserId: studentAuthUserId,
      senderAuthUserId: seniorAuthUserId,
      type: NotificationType.INTERVIEW_CONFIRMED,
      title: "🎉 Interview Confirmed!",
      message: `Your interview with ${seniorName} is confirmed. Check your email for the Google Meet link.`,
      data: { bookingId, slotId, startTime, endTime, meetLink, seniorName },
    });

    // In-app notification for senior
    await notificationService.createAndEmit({
      recipientAuthUserId: seniorAuthUserId,
      senderAuthUserId: studentAuthUserId,
      type: NotificationType.INTERVIEW_CONFIRMED,
      title: "📅 New Interview Booking",
      message: `${studentName} has booked your interview slot. Check your email for the Google Meet link.`,
      data: { bookingId, slotId, startTime, endTime, meetLink, studentName },
    });

    // Email notifications — fetch emails from auth-service
    const [studentInfo, seniorInfo] = await Promise.all([
      getUserInfo(studentAuthUserId),
      getUserInfo(seniorAuthUserId),
    ]);

    if (studentInfo && seniorInfo) {
      // Fire-and-forget — don't block the response
      sendInterviewConfirmationEmail({
        studentEmail: studentInfo.email,
        seniorEmail: seniorInfo.email,
        studentName,
        seniorName,
        startTime: startDate,
        endTime: endDate,
        meetLink,
      }).catch((err) => {
        console.error("[internal] Failed to send interview confirmation emails:", err);
      });
    } else {
      console.warn("[internal] Could not fetch user emails — skipping email notifications");
    }

    res.status(200).json({ success: true, data: { meetLink } });
  } catch (error) {
    next(error);
  }
};
