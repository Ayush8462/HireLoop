import { HydratedDocument, Model, Types } from "mongoose";
export declare enum ReferralStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    SUBMITTED = "SUBMITTED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface IReferral {
    studentId: Types.ObjectId;
    seniorId: Types.ObjectId;
    companyId: Types.ObjectId;
    jobTitle: string;
    jobUrl?: string;
    message?: string;
    status: ReferralStatus;
    createdAt: Date;
    updatedAt: Date;
}
export type ReferralDocument = HydratedDocument<IReferral>;
export declare const Referral: Model<IReferral>;
