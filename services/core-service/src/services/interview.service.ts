<<<<<<< HEAD
import mongoose, { Types } from 'mongoose';
import { ApiError } from '../utils/api-error.js';
import { interviewRepository } from '../respositories/interview.repository.js';
import { profileRepository } from '../respositories/profile.repository.js';
import { ProfileRole } from '../models/profile.model.js';
import { InterviewSlotStatus } from '../models/interview-slot.model.js';
import { InterviewBookingStatus } from '../models/interview-booking.model.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export class InterviewService {
  async createSlot(authUserId: string, input: { startTime: string; endTime: string; meetingUrl?: string }) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found. Create a profile first.');
    if (profile.role !== ProfileRole.SENIOR) throw new ApiError(403, 'Only seniors can perform this action');

    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    if (startTime <= new Date()) {
      throw new ApiError(400, 'Slot start time must be in the future');
    }

    const overlaps = await interviewRepository.findOverlappingSlots(profile._id, startTime, endTime);
    if (overlaps.length > 0) {
      throw new ApiError(409, 'This slot overlaps with an existing slot');
    }

    return interviewRepository.createSlot({
      seniorId: profile._id,
      startTime,
      endTime,
      meetingUrl: input.meetingUrl
    });
  }

  async getAvailableSlots(query: any) {
    const { page, limit, skip } = parsePagination(query);
    const filter: any = {};
    if (query.seniorId) {
      filter.seniorId = query.seniorId;
    }

    const [items, total] = await Promise.all([
      interviewRepository.findAvailableSlots(filter, skip, limit),
      interviewRepository.countAvailableSlots(filter)
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async updateSlot(authUserId: string, id: string, data: { startTime?: string; endTime?: string; meetingUrl?: string }) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');
    if (profile.role !== ProfileRole.SENIOR) throw new ApiError(403, 'Only seniors can perform this action');

    const slot = await interviewRepository.findSlotById(id);
    if (!slot) throw new ApiError(404, 'Slot not found');
    if (slot.seniorId.toString() !== profile._id.toString()) throw new ApiError(403, 'You do not own this slot');
    
    // Additional rules: if time is changed, check overlaps
    let startTime = slot.startTime;
    let endTime = slot.endTime;

    if (data.startTime) startTime = new Date(data.startTime);
    if (data.endTime) endTime = new Date(data.endTime);

    if (data.startTime || data.endTime) {
      if (startTime <= new Date()) throw new ApiError(400, 'Slot start time must be in the future');
      if (startTime >= endTime) throw new ApiError(400, 'endTime must be after startTime');

      const overlaps = await interviewRepository.findOverlappingSlots(profile._id, startTime, endTime, id);
      if (overlaps.length > 0) throw new ApiError(409, 'Updated slot overlaps with an existing slot');
    }

    const updated = await interviewRepository.updateSlot(id, profile._id, {
      ...(data.startTime && { startTime }),
      ...(data.endTime && { endTime }),
      ...(data.meetingUrl !== undefined && { meetingUrl: data.meetingUrl })
    });

    if (!updated) throw new ApiError(404, 'Slot not found or not owned by you');
    return updated;
  }

  async deleteSlot(authUserId: string, id: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');
    if (profile.role !== ProfileRole.SENIOR) throw new ApiError(403, 'Only seniors can perform this action');

    const slot = await interviewRepository.findSlotById(id);
    if (!slot) throw new ApiError(404, 'Slot not found');
    if (slot.status !== InterviewSlotStatus.AVAILABLE) throw new ApiError(400, 'Only available slots can be deleted');

    const deleted = await interviewRepository.deleteSlot(id, profile._id);
    if (!deleted) throw new ApiError(404, 'Slot not found, not available, or not owned by you');
  }

  async bookSlot(authUserId: string, input: { slotId: string; notes?: string }) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) throw new ApiError(404, 'Profile not found');
    if (studentProfile.role !== ProfileRole.STUDENT) throw new ApiError(403, 'Only students can perform this action');

    const slot = await interviewRepository.findSlotById(input.slotId);
    if (!slot) throw new ApiError(404, 'Interview slot not found');
    if (slot.status !== InterviewSlotStatus.AVAILABLE) throw new ApiError(409, 'Slot is not available');
    if (new Date() > slot.startTime) throw new ApiError(400, 'Cannot book a slot that has already started');

    if (slot.seniorId.toString() === studentProfile._id.toString()) {
       throw new ApiError(400, 'Cannot book your own interview slot');
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const bookedSlot = await interviewRepository.atomicBookSlot(new Types.ObjectId(input.slotId), session);
      if (!bookedSlot) {
        await session.abortTransaction();
        throw new ApiError(409, 'Slot was just booked by someone else. Please choose another slot.');
      }

      const booking = await interviewRepository.createBooking({
        slotId: bookedSlot._id,
        studentId: studentProfile._id,
        seniorId: slot.seniorId,
        notes: input.notes
      }, session);

      await session.commitTransaction();
      return booking;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async getStudentBookings(authUserId: string, query: any) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');
    if (profile.role !== ProfileRole.STUDENT) throw new ApiError(403, 'Only students can perform this action');

    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      interviewRepository.findBookingsByStudent(profile._id, skip, limit),
      interviewRepository.countBookingsByStudent(profile._id)
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getSeniorBookings(authUserId: string, query: any) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');
    if (profile.role !== ProfileRole.SENIOR) throw new ApiError(403, 'Only seniors can perform this action');

    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      interviewRepository.findBookingsBySenior(profile._id, skip, limit),
      interviewRepository.countBookingsBySenior(profile._id)
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getBookingById(authUserId: string, id: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const booking = await interviewRepository.findBookingById(id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.studentId.toString() !== profile._id.toString() && booking.seniorId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'You are not involved in this booking');
    }

    return booking;
  }

  async cancelBooking(authUserId: string, id: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const booking = await interviewRepository.findBookingById(id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.studentId.toString() !== profile._id.toString() && booking.seniorId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'You are not involved in this booking');
    }

    if (booking.status !== InterviewBookingStatus.CONFIRMED) {
      throw new ApiError(400, `Cannot cancel booking with status ${booking.status}`);
    }

    // Cancel booking and make slot available again
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      booking.status = InterviewBookingStatus.CANCELLED;
      await booking.save({ session });

      await interviewRepository.makeSlotAvailable(booking.slotId, session);

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async completeBooking(authUserId: string, id: string, status: InterviewBookingStatus) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');
    if (profile.role !== ProfileRole.SENIOR) throw new ApiError(403, 'Only seniors can perform this action');

    const booking = await interviewRepository.findBookingById(id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.seniorId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'You are not the senior for this booking');
    }

    const validTransitions: Record<string, string[]> = {
      CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw new ApiError(409, `Cannot transition from ${booking.status} to ${status}`);
    }

    if (status !== InterviewBookingStatus.COMPLETED && status !== InterviewBookingStatus.NO_SHOW) {
      throw new ApiError(400, 'Invalid status update for completeBooking');
    }

    const updated = await interviewRepository.updateBookingStatus(id, status);
    return updated;
=======
import { Types } from "mongoose";
import { interviewRepository } from "../respositories/interview.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { ApiError } from "../utils/api-error.js";
import { InterviewSlotStatus } from "../models/interview-slot.model.js";
import { InterviewBookingStatus } from "../models/interview-booking.model.js";

interface CreateSlotInput {
  startTime: string;
  endTime: string;
}

interface BookInterviewInput {
  slotId: string;
  notes?: string;
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

    // Create booking
    return interviewRepository.createBooking({
      slotId: slot._id,
      studentId: studentProfile._id,
      seniorId: slot.seniorId._id,
      status: InterviewBookingStatus.CONFIRMED,
      notes: data.notes,
    });
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

    return interviewRepository.findStudentBookings(studentProfile._id);
  }

  async getMySeniorHistory(authUserId: string) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) {
      throw new ApiError(404, "Profile not found");
    }

    return interviewRepository.findSeniorBookings(seniorProfile._id);
  }

  async getStats() {
    return interviewRepository.getBookingStats();
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }
}

export const interviewService = new InterviewService();
