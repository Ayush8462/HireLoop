import { Types } from "mongoose";
interface CreateSlotInput {
    startTime: string;
    endTime: string;
}
interface BookInterviewInput {
    slotId: string;
    notes?: string;
}
export declare class InterviewService {
    createSlot(authUserId: string, data: CreateSlotInput): Promise<import("mongoose").Document<unknown, {}, import("../models/interview-slot.model.js").IInterviewSlot, {}, import("mongoose").DefaultSchemaOptions> & import("../models/interview-slot.model.js").IInterviewSlot & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getAvailableSlots(seniorId?: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/interview-slot.model.js").IInterviewSlot, {}, import("mongoose").DefaultSchemaOptions> & import("../models/interview-slot.model.js").IInterviewSlot & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    bookInterview(authUserId: string, data: BookInterviewInput): Promise<import("mongoose").Document<unknown, {}, import("../models/interview-booking.model.js").IInterviewBooking, {}, import("mongoose").DefaultSchemaOptions> & import("../models/interview-booking.model.js").IInterviewBooking & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    completeInterview(authUserId: string, bookingId: string, notes?: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/interview-booking.model.js").IInterviewBooking, {}, import("mongoose").DefaultSchemaOptions> & import("../models/interview-booking.model.js").IInterviewBooking & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    cancelInterview(authUserId: string, bookingId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/interview-booking.model.js").IInterviewBooking, {}, import("mongoose").DefaultSchemaOptions> & import("../models/interview-booking.model.js").IInterviewBooking & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    getMyStudentHistory(authUserId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/interview-booking.model.js").IInterviewBooking, {}, import("mongoose").DefaultSchemaOptions> & import("../models/interview-booking.model.js").IInterviewBooking & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMySeniorHistory(authUserId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/interview-booking.model.js").IInterviewBooking, {}, import("mongoose").DefaultSchemaOptions> & import("../models/interview-booking.model.js").IInterviewBooking & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getStats(): Promise<{
        total: number;
        completed: number;
        cancelled: number;
        confirmed: number;
        completionRate: number;
    }>;
}
export declare const interviewService: InterviewService;
export {};
