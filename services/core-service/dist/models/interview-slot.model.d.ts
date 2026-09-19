import { HydratedDocument, Model, Types } from "mongoose";
export declare enum InterviewSlotStatus {
    AVAILABLE = "AVAILABLE",
    BOOKED = "BOOKED",
    CANCELLED = "CANCELLED"
}
export interface IInterviewSlot {
    seniorId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: InterviewSlotStatus;
    createdAt: Date;
    updatedAt: Date;
}
export type InterviewSlotDocument = HydratedDocument<IInterviewSlot>;
export declare const InterviewSlot: Model<IInterviewSlot>;
