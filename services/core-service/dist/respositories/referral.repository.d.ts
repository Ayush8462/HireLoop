import { Types } from "mongoose";
import { ReferralDocument, IReferral, ReferralStatus } from "../models/referral.model.js";
export declare class ReferralRepository {
    create(data: Omit<IReferral, "createdAt" | "updatedAt">): Promise<ReferralDocument>;
    findById(id: string): Promise<ReferralDocument | null>;
    countTodayByStudentId(studentId: Types.ObjectId): Promise<number>;
    findExistingPending(studentId: Types.ObjectId, seniorId: Types.ObjectId, companyId: Types.ObjectId, jobTitle: string): Promise<ReferralDocument | null>;
    findByStudentId(studentId: Types.ObjectId, status?: ReferralStatus): Promise<ReferralDocument[]>;
    findBySeniorId(seniorId: Types.ObjectId, status?: ReferralStatus): Promise<ReferralDocument[]>;
    updateStatus(id: string, status: ReferralStatus): Promise<ReferralDocument | null>;
}
export declare const referralRepository: ReferralRepository;
