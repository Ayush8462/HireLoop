import { Types } from "mongoose";
<<<<<<< HEAD
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
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }
}

export const referralRepository = new ReferralRepository();
