import { InterviewSlot, InterviewSlotStatus, } from "../models/interview-slot.model.js";
import { InterviewBooking, InterviewBookingStatus, } from "../models/interview-booking.model.js";
export class InterviewRepository {
    async createSlot(data) {
        return InterviewSlot.create(data);
    }
    async findAvailableSlots(seniorId) {
        const query = {
            status: InterviewSlotStatus.AVAILABLE,
            startTime: { $gte: new Date() },
        };
        if (seniorId)
            query.seniorId = seniorId;
        return InterviewSlot.find(query)
            .sort({ startTime: 1 })
            .populate("seniorId");
    }
    async findSlotById(id) {
        return InterviewSlot.findById(id).populate("seniorId");
    }
    async updateSlotStatus(id, status) {
        return InterviewSlot.findByIdAndUpdate(id, { status }, { new: true });
    }
    async createBooking(data) {
        return InterviewBooking.create(data);
    }
    async findBookingById(id) {
        return InterviewBooking.findById(id)
            .populate("slotId")
            .populate("studentId")
            .populate("seniorId");
    }
    async findStudentBookings(studentId) {
        return InterviewBooking.find({ studentId })
            .sort({ createdAt: -1 })
            .populate("slotId")
            .populate("seniorId");
    }
    async findSeniorBookings(seniorId) {
        return InterviewBooking.find({ seniorId })
            .sort({ createdAt: -1 })
            .populate("slotId")
            .populate("studentId");
    }
    async updateBookingStatus(id, status, notes) {
        const update = { status };
        if (notes !== undefined)
            update.notes = notes;
        return InterviewBooking.findByIdAndUpdate(id, update, { new: true })
            .populate("slotId")
            .populate("studentId")
            .populate("seniorId");
    }
    async getBookingStats() {
        const total = await InterviewBooking.countDocuments();
        const completed = await InterviewBooking.countDocuments({
            status: InterviewBookingStatus.COMPLETED,
        });
        const cancelled = await InterviewBooking.countDocuments({
            status: InterviewBookingStatus.CANCELLED,
        });
        const confirmed = await InterviewBooking.countDocuments({
            status: InterviewBookingStatus.CONFIRMED,
        });
        const completionRate = total === 0 ? 0 : Number(((completed / total) * 100).toFixed(2));
        return {
            total,
            completed,
            cancelled,
            confirmed,
            completionRate,
        };
    }
}
export const interviewRepository = new InterviewRepository();
//# sourceMappingURL=interview.repository.js.map