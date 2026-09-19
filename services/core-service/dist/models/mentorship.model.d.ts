import { HydratedDocument, Model, Types } from "mongoose";
export declare enum MentorshipStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export interface IMentorship {
    studentId: Types.ObjectId;
    seniorId: Types.ObjectId;
    message?: string;
    status: MentorshipStatus;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export type MentorshipDocument = HydratedDocument<IMentorship>;
export declare const Mentorship: Model<IMentorship>;
