import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

// Verify transport on startup (optional, logs success/failure)
transporter.verify((error) => {
  if (error) {
    console.error("[email] Gmail SMTP connection failed:", error.message);
  } else {
    console.info("[email] Gmail SMTP ready to send emails");
  }
});

export interface InterviewConfirmationEmailData {
  studentEmail: string;
  seniorEmail: string;
  studentName: string;
  seniorName: string;
  startTime: Date;
  endTime: Date;
  meetLink: string;
}

/**
 * Generate a Google Meet-style link using a UUID.
 * Format: https://meet.google.com/xxx-xxxx-xxx
 */
export function generateMeetLink(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function buildEmailHtml(
  recipientName: string,
  otherPartyLabel: string,
  otherPartyName: string,
  startTime: Date,
  endTime: Date,
  meetLink: string,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interview Confirmed — HireLoop</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 36px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 18px; font-weight: 600; color: #18181b; margin-bottom: 16px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-size: 13px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 600; text-align: right; max-width: 60%; }
    .meet-button { display: block; width: fit-content; margin: 28px auto; padding: 14px 32px; background: #4285f4; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.2px; }
    .meet-link-text { text-align: center; font-size: 13px; color: #94a3b8; margin-top: 8px; }
    .meet-link-text a { color: #6366f1; word-break: break-all; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
    .footer { padding: 20px 40px 32px; text-align: center; }
    .footer p { font-size: 13px; color: #94a3b8; margin: 4px 0; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Interview Confirmed!</h1>
      <p>Your interview has been scheduled on HireLoop</p>
    </div>
    <div class="body">
      <div class="badge">✓ Confirmed</div>
      <div class="greeting">Hi ${recipientName},</div>
      <p style="color:#475569;line-height:1.6;">
        Great news! Your interview with <strong>${otherPartyName}</strong> (${otherPartyLabel}) 
        has been confirmed. Please find the details below and join using Google Meet at the scheduled time.
      </p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">${otherPartyLabel}</span>
          <span class="info-value">${otherPartyName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date &amp; Start Time</span>
          <span class="info-value">${formatDateTime(startTime)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">End Time</span>
          <span class="info-value">${formatDateTime(endTime)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Platform</span>
          <span class="info-value">Google Meet</span>
        </div>
      </div>

      <a class="meet-button" href="${meetLink}" target="_blank">
        📹 Join Google Meet
      </a>
      <div class="meet-link-text">
        Or copy this link: <a href="${meetLink}">${meetLink}</a>
      </div>

      <hr class="divider" />
      <p style="color:#64748b;font-size:14px;line-height:1.6;">
        💡 <strong>Tip:</strong> Make sure to test your camera and microphone before the interview. 
        Be ready a few minutes early and have your resume handy!
      </p>
    </div>
    <div class="footer">
      <p>This email was sent by <strong>HireLoop</strong> — Smart Placement Platform</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send interview confirmation emails to both student and senior.
 */
export async function sendInterviewConfirmationEmail(
  data: InterviewConfirmationEmailData,
): Promise<void> {
  const { studentEmail, seniorEmail, studentName, seniorName, startTime, endTime, meetLink } = data;

  // Email to student
  await transporter.sendMail({
    from: `"HireLoop" <${env.GMAIL_USER}>`,
    to: studentEmail,
    subject: "✅ Interview Confirmed — HireLoop",
    html: buildEmailHtml(
      studentName,
      "Interviewer (Senior)",
      seniorName,
      startTime,
      endTime,
      meetLink,
    ),
  });

  // Email to senior
  await transporter.sendMail({
    from: `"HireLoop" <${env.GMAIL_USER}>`,
    to: seniorEmail,
    subject: "✅ Interview Confirmed — HireLoop",
    html: buildEmailHtml(
      seniorName,
      "Candidate (Student)",
      studentName,
      startTime,
      endTime,
      meetLink,
    ),
  });

  console.info(`[email] Interview confirmation emails sent to ${studentEmail} and ${seniorEmail}`);
}
