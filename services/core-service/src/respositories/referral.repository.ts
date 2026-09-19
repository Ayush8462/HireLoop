import { Types } from "mongoose";
import {
  Referral,
  ReferralDocument,
  IReferral,
  ReferralStatus,
} from "../models/referral.model.js";

export class ReferralRepository {
  async create(data: Omit<IReferral, "createdAt" | "updatedAt">): Promise<ReferralDocument> {
    return Referral.create(data);
  }

  async findById(id: string): Promise<ReferralDocument | null> {
    return Referral.findById(id)
      .populate("studentId")
      .populate("seniorId")
      .populate("companyId");
  }

  async countTodayByStudentId(studentId: Types.ObjectId): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Referral.countDocuments({
      studentId,
      createdAt: { $gte: today },
    });
  }

  async findExistingPending(
    studentId: Types.ObjectId,
    seniorId: Types.ObjectId,
    companyId: Types.ObjectId,
    jobTitle: string
  ): Promise<ReferralDocument | null> {
    return Referral.findOne({
      studentId,
      seniorId,
      companyId,
      jobTitle: { $regex: new RegExp(`^${jobTitle}$`, "i") },
      status: ReferralStatus.PENDING,
    });
  }

  async findByStudentId(
    studentId: Types.ObjectId,
    status?: ReferralStatus
  ): Promise<ReferralDocument[]> {
    const query: Record<string, unknown> = { studentId };
    if (status) query.status = status;

    return Referral.find(query)
      .sort({ createdAt: -1 })
      .populate("seniorId")
      .populate("companyId");
  }

  async findBySeniorId(
    seniorId: Types.ObjectId,
    status?: ReferralStatus
  ): Promise<ReferralDocument[]> {
    const query: Record<string, unknown> = { seniorId };
    if (status) query.status = status;

    return Referral.find(query)
      .sort({ createdAt: -1 })
      .populate("studentId")
      .populate("companyId");
  }

  async updateStatus(
    id: string,
    status: ReferralStatus
  ): Promise<ReferralDocument | null> {
    return Referral.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("studentId")
      .populate("seniorId")
      .populate("companyId");
  }
}

export const referralRepository = new ReferralRepository();
