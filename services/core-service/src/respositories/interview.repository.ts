<<<<<<< HEAD
import { Types, ClientSession } from 'mongoose';
import { InterviewSlot, IInterviewSlot, InterviewSlotStatus, InterviewSlotDocument } from '../models/interview-slot.model.js';
import { InterviewBooking, IInterviewBooking, InterviewBookingStatus, InterviewBookingDocument } from '../models/interview-booking.model.js';

export class InterviewRepository {
  // ── Slot operations ──────────────────────────────────────────────────

  async createSlot(data: {
    seniorId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    meetingUrl?: string;
  }): Promise<InterviewSlotDocument> {
    const slot = new InterviewSlot({ ...data, status: InterviewSlotStatus.AVAILABLE });
    return slot.save();
  }

  async findSlotById(id: string): Promise<InterviewSlotDocument | null> {
    return InterviewSlot.findById(id).exec();
  }

  async findAvailableSlots(
    filter: { seniorId?: string },
    skip: number,
    limit: number
  ): Promise<InterviewSlotDocument[]> {
    const query: any = { status: InterviewSlotStatus.AVAILABLE };
    if (filter.seniorId) {
      query.seniorId = new Types.ObjectId(filter.seniorId);
    }
    return InterviewSlot.find(query)
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countAvailableSlots(filter: { seniorId?: string }): Promise<number> {
    const query: any = { status: InterviewSlotStatus.AVAILABLE };
    if (filter.seniorId) {
      query.seniorId = new Types.ObjectId(filter.seniorId);
    }
    return InterviewSlot.countDocuments(query).exec();
  }

  async findOverlappingSlots(
    seniorId: Types.ObjectId,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<InterviewSlotDocument[]> {
    const query: any = {
      seniorId,
      status: { $ne: InterviewSlotStatus.CANCELLED },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    };
    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return InterviewSlot.find(query).exec();
  }

  async updateSlot(
    id: string,
    seniorId: Types.ObjectId,
    data: Partial<IInterviewSlot>
  ): Promise<InterviewSlotDocument | null> {
    return InterviewSlot.findOneAndUpdate(
      { _id: new Types.ObjectId(id), seniorId },
      { $set: data },
      { new: true }
    ).exec();
  }

  async deleteSlot(id: string, seniorId: Types.ObjectId): Promise<boolean> {
    const result = await InterviewSlot.deleteOne({ 
      _id: new Types.ObjectId(id), 
      seniorId,
      status: InterviewSlotStatus.AVAILABLE 
    }).exec();
    return result.deletedCount === 1;
  }

  async atomicBookSlot(
    slotId: Types.ObjectId,
    session: ClientSession
  ): Promise<InterviewSlotDocument | null> {
    return InterviewSlot.findOneAndUpdate(
      { _id: slotId, status: InterviewSlotStatus.AVAILABLE },
      { $set: { status: InterviewSlotStatus.BOOKED } },
      { new: true, session }
    ).exec();
  }

  async makeSlotAvailable(slotId: Types.ObjectId, session?: ClientSession): Promise<void> {
    const query = InterviewSlot.updateOne(
      { _id: slotId },
      { $set: { status: InterviewSlotStatus.AVAILABLE } }
    );
    if (session) {
      query.session(session);
    }
    await query.exec();
  }

  // ── Booking operations ───────────────────────────────────────────────

  async createBooking(
    data: {
      slotId: Types.ObjectId;
      studentId: Types.ObjectId;
      seniorId: Types.ObjectId;
      notes?: string;
    },
    session: ClientSession
  ): Promise<InterviewBookingDocument> {
    const booking = new InterviewBooking({
      ...data,
      status: InterviewBookingStatus.CONFIRMED
    });
    return booking.save({ session });
  }

  async findBookingById(id: string): Promise<InterviewBookingDocument | null> {
    return InterviewBooking.findById(id).exec();
  }

  async findBookingsByStudent(
    studentId: Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<InterviewBookingDocument[]> {
    return InterviewBooking.find({ studentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('slotId')
      .exec();
  }

  async countBookingsByStudent(studentId: Types.ObjectId): Promise<number> {
    return InterviewBooking.countDocuments({ studentId }).exec();
  }

  async findBookingsBySenior(
    seniorId: Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<InterviewBookingDocument[]> {
    return InterviewBooking.find({ seniorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('slotId')
      .exec();
  }

  async countBookingsBySenior(seniorId: Types.ObjectId): Promise<number> {
    return InterviewBooking.countDocuments({ seniorId }).exec();
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }

  async updateBookingStatus(
    id: string,
<<<<<<< HEAD
    status: InterviewBookingStatus
  ): Promise<InterviewBookingDocument | null> {
    return InterviewBooking.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).exec();
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }
}

export const interviewRepository = new InterviewRepository();
