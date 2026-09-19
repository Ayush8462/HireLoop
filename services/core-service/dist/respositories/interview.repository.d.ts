import { Types } from "mongoose";
import { InterviewSlotDocument, IInterviewSlot, InterviewSlotStatus } from "../models/interview-slot.model.js";
import { InterviewBookingDocument, IInterviewBooking, InterviewBookingStatus } from "../models/interview-booking.model.js";
export declare class InterviewRepository {
    createSlot(data: Omit<IInterviewSlot, "createdAt" | "updatedAt">): Promise<InterviewSlotDocument>;
    findAvailableSlots(seniorId?: Types.ObjectId): Promise<InterviewSlotDocument[]>;
    findSlotById(id: string): Promise<InterviewSlotDocument | null>;
    updateSlotStatus(id: string | Types.ObjectId, status: InterviewSlotStatus): Promise<InterviewSlotDocument | null>;
    createBooking(data: Omit<IInterviewBooking, "createdAt" | "updatedAt">): Promise<InterviewBookingDocument>;
    findBookingById(id: string): Promise<InterviewBookingDocument | null>;
    findStudentBookings(studentId: Types.ObjectId): Promise<InterviewBookingDocument[]>;
    findSeniorBookings(seniorId: Types.ObjectId): Promise<InterviewBookingDocument[]>;
    updateBookingStatus(id: string, status: InterviewBookingStatus, notes?: string): Promise<InterviewBookingDocument | null>;
    getBookingStats(): Promise<{
        total: number;
        completed: number;
        cancelled: number;
        confirmed: number;
        completionRate: number;
    }>;
}
export declare const interviewRepository: InterviewRepository;
