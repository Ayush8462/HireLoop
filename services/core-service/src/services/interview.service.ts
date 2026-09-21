import { Types } from "mongoose";
import { interviewRepository } from "../respositories/interview.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { ApiError } from "../utils/api-error.js";
import { InterviewSlotStatus } from "../models/interview-slot.model.js";
import { InterviewBookingStatus } from "../models/interview-booking.model.js";
import { notificationClient } from "./notification-client.service.js";

interface CreateSlotInput {
  startTime: string;
  endTime: string;
}

interface BookInterviewInput {
  slotId: string;
  notes?: string;
}

function generateMeetLink(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
}

export class InterviewService {
  async createSlot(authUserId: string, data: CreateSlotInput) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) {
      throw new ApiError(404, "Senior profile not found. Please create a profile first.");
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid start or end time format");
    }

    if (end <= start) {
      throw new ApiError(400, "End time must be after start time");
    }

    if (start < new Date()) {
      throw new ApiError(400, "Slot start time cannot be in the past");
    }

    return interviewRepository.createSlot({
      seniorId: seniorProfile._id,
      startTime: start,
      endTime: end,
      status: InterviewSlotStatus.AVAILABLE,
    });
  }

  async getAvailableSlots(seniorId?: string) {
    let seniorObjectId: Types.ObjectId | undefined;
    if (seniorId) {
      if (!Types.ObjectId.isValid(seniorId)) {
        throw new ApiError(400, "Invalid senior ID");
      }
      seniorObjectId = new Types.ObjectId(seniorId);
    }

    return interviewRepository.findAvailableSlots(seniorObjectId);
  }

  async bookInterview(authUserId: string, data: BookInterviewInput) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) {
      throw new ApiError(404, "Student profile not found. Please create a profile first.");
    }

    if (!Types.ObjectId.isValid(data.slotId)) {
      throw new ApiError(400, "Invalid slot ID");
    }

    const slot = await interviewRepository.findSlotById(data.slotId);
    if (!slot) {
      throw new ApiError(404, "Interview slot not found");
    }

    if (slot.status !== InterviewSlotStatus.AVAILABLE) {
      throw new ApiError(409, "This interview slot is already booked or unavailable");
    }

    if (slot.seniorId._id.equals(studentProfile._id)) {
      throw new ApiError(400, "You cannot book your own interview slot");
    }

    // Mark slot as booked
    await interviewRepository.updateSlotStatus(slot._id, InterviewSlotStatus.BOOKED);

    const meetLink = generateMeetLink();

    // Create booking
    const booking = await interviewRepository.createBooking({
      slotId: slot._id,
      studentId: studentProfile._id,
      seniorId: slot.seniorId._id,
      status: InterviewBookingStatus.CONFIRMED,
      notes: data.notes,
      meetLink,
    });

    // Notify both student and senior + send email with Google Meet link (fire-and-forget)
    const seniorProfile = await profileRepository.findById(slot.seniorId._id.toString());
    if (seniorProfile) {
      notificationClient.fireInterviewConfirmed({
        bookingId: booking._id.toString(),
        slotId: slot._id.toString(),
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        studentAuthUserId: authUserId,
        seniorAuthUserId: seniorProfile.authUserId,
        studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
        seniorName: `${seniorProfile.firstName} ${seniorProfile.lastName}`,
        meetLink,
      });
    }

    return booking;
  }

  async completeInterview(authUserId: string, bookingId: string, notes?: string) {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new ApiError(400, "Invalid booking ID");
    }

    const booking = await interviewRepository.findBookingById(bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const userProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!userProfile) {
      throw new ApiError(404, "Profile not found");
    }

    if (!booking.seniorId._id.equals(userProfile._id)) {
      throw new ApiError(403, "Only the assigned interviewer can mark this interview as completed");
    }

    if (booking.status !== InterviewBookingStatus.CONFIRMED) {
      throw new ApiError(400, "Only confirmed interviews can be completed");
    }

    return interviewRepository.updateBookingStatus(
      bookingId,
      InterviewBookingStatus.COMPLETED,
      notes
    );
  }

  async cancelInterview(authUserId: string, bookingId: string) {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new ApiError(400, "Invalid booking ID");
    }

    const booking = await interviewRepository.findBookingById(bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const userProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!userProfile) {
      throw new ApiError(404, "Profile not found");
    }

    const isStudent = booking.studentId._id.equals(userProfile._id);
    const isSenior = booking.seniorId._id.equals(userProfile._id);

    if (!isStudent && !isSenior) {
      throw new ApiError(403, "You are not authorized to cancel this booking");
    }

    // Free up the slot
    await interviewRepository.updateSlotStatus(booking.slotId._id, InterviewSlotStatus.AVAILABLE);

    return interviewRepository.updateBookingStatus(
      bookingId,
      InterviewBookingStatus.CANCELLED
    );
  }

  async getMyStudentHistory(authUserId: string) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) {
      throw new ApiError(404, "Profile not found");
    }

    const bookings = await interviewRepository.findStudentBookings(studentProfile._id);
    for (const b of bookings) {
      if (b.status === InterviewBookingStatus.CONFIRMED && !b.meetLink) {
        b.meetLink = generateMeetLink();
        await b.save();
      }
    }
    return bookings;
  }

  async getMySeniorHistory(authUserId: string) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) {
      throw new ApiError(404, "Profile not found");
    }

    const bookings = await interviewRepository.findSeniorBookings(seniorProfile._id);
    for (const b of bookings) {
      if (b.status === InterviewBookingStatus.CONFIRMED && !b.meetLink) {
        b.meetLink = generateMeetLink();
        await b.save();
      }
    }
    return bookings;
  }

  async getStats() {
    return interviewRepository.getBookingStats();
  }
}

export const interviewService = new InterviewService();
