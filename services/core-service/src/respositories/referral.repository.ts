import { Types } from "mongoose";
import { Referral, ReferralDocument, ReferralStatus } from "../models/referral.model.js";

class ReferralRepository {
  async create(data: {
    studentId: Types.ObjectId;
    seniorId: Types.ObjectId;
    companyId: Types.ObjectId;
    jobTitle: string;
    jobUrl?: string;
    message?: string;
  }): Promise<ReferralDocument> {
    const referral = new Referral({
      ...data,
      status: ReferralStatus.PENDING,
    });
    return referral.save();
  }

  async findById(id: string): Promise<ReferralDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Referral.findById(id);
  }

  async findSentByStudent(studentId: Types.ObjectId, skip: number, limit: number): Promise<ReferralDocument[]> {
    return Referral.find({ studentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countSentByStudent(studentId: Types.ObjectId): Promise<number> {
    return Referral.countDocuments({ studentId });
  }

  async findReceivedBySenior(seniorId: Types.ObjectId, skip: number, limit: number): Promise<ReferralDocument[]> {
    return Referral.find({ seniorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countReceivedBySenior(seniorId: Types.ObjectId): Promise<number> {
    return Referral.countDocuments({ seniorId });
  }

  async updateStatus(id: string, status: ReferralStatus, responseMessage?: string): Promise<ReferralDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Referral.findByIdAndUpdate(
      id,
      { status, ...(responseMessage !== undefined && { responseMessage }), respondedAt: new Date() },
      { new: true, runValidators: true }
    );
  }
}

export const referralRepository = new ReferralRepository();
