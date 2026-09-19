import { Types } from "mongoose";
import {
  InterviewSlot,
  InterviewSlotDocument,
  IInterviewSlot,
  InterviewSlotStatus,
} from "../models/interview-slot.model.js";
import {
  InterviewBooking,
  InterviewBookingDocument,
  IInterviewBooking,
  InterviewBookingStatus,
} from "../models/interview-booking.model.js";

export class InterviewRepository {
  async createSlot(data: Omit<IInterviewSlot, "createdAt" | "updatedAt">): Promise<InterviewSlotDocument> {
    return InterviewSlot.create(data);
  }

  async findAvailableSlots(seniorId?: Types.ObjectId): Promise<InterviewSlotDocument[]> {
    const query: Record<string, unknown> = {
      status: InterviewSlotStatus.AVAILABLE,
      startTime: { $gte: new Date() },
    };
    if (seniorId) query.seniorId = seniorId;

    return InterviewSlot.find(query)
      .sort({ startTime: 1 })
      .populate("seniorId");
  }

  async findSlotById(id: string): Promise<InterviewSlotDocument | null> {
    return InterviewSlot.findById(id).populate("seniorId");
  }

  async updateSlotStatus(
    id: string | Types.ObjectId,
    status: InterviewSlotStatus
  ): Promise<InterviewSlotDocument | null> {
    return InterviewSlot.findByIdAndUpdate(id, { status }, { new: true });
  }

  async createBooking(
    data: Omit<IInterviewBooking, "createdAt" | "updatedAt">
  ): Promise<InterviewBookingDocument> {
    return InterviewBooking.create(data);
  }

  async findBookingById(id: string): Promise<InterviewBookingDocument | null> {
    return InterviewBooking.findById(id)
      .populate("slotId")
      .populate("studentId")
      .populate("seniorId");
  }

  async findStudentBookings(studentId: Types.ObjectId): Promise<InterviewBookingDocument[]> {
    return InterviewBooking.find({ studentId })
      .sort({ createdAt: -1 })
      .populate("slotId")
      .populate("seniorId");
  }

  async findSeniorBookings(seniorId: Types.ObjectId): Promise<InterviewBookingDocument[]> {
    return InterviewBooking.find({ seniorId })
      .sort({ createdAt: -1 })
      .populate("slotId")
      .populate("studentId");
  }

  async updateBookingStatus(
    id: string,
    status: InterviewBookingStatus,
    notes?: string
  ): Promise<InterviewBookingDocument | null> {
    const update: Record<string, unknown> = { status };
    if (notes !== undefined) update.notes = notes;

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
