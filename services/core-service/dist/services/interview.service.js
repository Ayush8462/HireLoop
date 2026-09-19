import { Types } from "mongoose";
import { interviewRepository } from "../respositories/interview.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { ApiError } from "../utils/api-error.js";
import { InterviewSlotStatus } from "../models/interview-slot.model.js";
import { InterviewBookingStatus } from "../models/interview-booking.model.js";
export class InterviewService {
    async createSlot(authUserId, data) {
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
    async getAvailableSlots(seniorId) {
        let seniorObjectId;
        if (seniorId) {
            if (!Types.ObjectId.isValid(seniorId)) {
                throw new ApiError(400, "Invalid senior ID");
            }
            seniorObjectId = new Types.ObjectId(seniorId);
        }
        return interviewRepository.findAvailableSlots(seniorObjectId);
    }
    async bookInterview(authUserId, data) {
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
    async completeInterview(authUserId, bookingId, notes) {
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
        return interviewRepository.updateBookingStatus(bookingId, InterviewBookingStatus.COMPLETED, notes);
    }
    async cancelInterview(authUserId, bookingId) {
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
        return interviewRepository.updateBookingStatus(bookingId, InterviewBookingStatus.CANCELLED);
    }
    async getMyStudentHistory(authUserId) {
        const studentProfile = await profileRepository.findByAuthUserId(authUserId);
        if (!studentProfile) {
            throw new ApiError(404, "Profile not found");
        }
        return interviewRepository.findStudentBookings(studentProfile._id);
    }
    async getMySeniorHistory(authUserId) {
        const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
        if (!seniorProfile) {
            throw new ApiError(404, "Profile not found");
        }
        return interviewRepository.findSeniorBookings(seniorProfile._id);
    }
    async getStats() {
        return interviewRepository.getBookingStats();
    }
}
export const interviewService = new InterviewService();
//# sourceMappingURL=interview.service.js.map