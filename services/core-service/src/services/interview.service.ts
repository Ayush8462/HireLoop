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
  }
}

export const interviewService = new InterviewService();
