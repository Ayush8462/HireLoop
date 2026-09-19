import { HydratedDocument, Model, Types } from "mongoose";
export declare enum InterviewBookingStatus {
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export interface IInterviewBooking {
    slotId: Types.ObjectId;
    studentId: Types.ObjectId;
    seniorId: Types.ObjectId;
    status: InterviewBookingStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type InterviewBookingDocument = HydratedDocument<IInterviewBooking>;
export declare const InterviewBooking: Model<IInterviewBooking>;
