import { Types } from "mongoose";
import { Mentorship, MentorshipDocument, MentorshipStatus } from "../models/mentorship.model.js";

class MentorshipRepository {
  async create(data: { studentId: Types.ObjectId; seniorId: Types.ObjectId; message?: string }): Promise<MentorshipDocument> {
    const mentorship = new Mentorship({
      ...data,
      status: MentorshipStatus.PENDING,
    });
    return mentorship.save();
  }

  async findById(id: string): Promise<MentorshipDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Mentorship.findById(id);
  }

  async findPendingBetween(studentId: Types.ObjectId, seniorId: Types.ObjectId): Promise<MentorshipDocument | null> {
    return Mentorship.findOne({
      studentId,
      seniorId,
      status: MentorshipStatus.PENDING,
    });
  }

  async findSentByStudent(studentId: Types.ObjectId, skip: number, limit: number): Promise<MentorshipDocument[]> {
    return Mentorship.find({ studentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countSentByStudent(studentId: Types.ObjectId): Promise<number> {
    return Mentorship.countDocuments({ studentId });
  }

  async findReceivedBySenior(seniorId: Types.ObjectId, skip: number, limit: number): Promise<MentorshipDocument[]> {
    return Mentorship.find({ seniorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countReceivedBySenior(seniorId: Types.ObjectId): Promise<number> {
    return Mentorship.countDocuments({ seniorId });
  }

  async findConnections(profileId: Types.ObjectId, skip: number, limit: number): Promise<MentorshipDocument[]> {
    return Mentorship.find({
      status: MentorshipStatus.ACCEPTED,
      $or: [{ studentId: profileId }, { seniorId: profileId }],
    })
      .sort({ respondedAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countConnections(profileId: Types.ObjectId): Promise<number> {
    return Mentorship.countDocuments({
      status: MentorshipStatus.ACCEPTED,
      $or: [{ studentId: profileId }, { seniorId: profileId }],
    });
  }

  async updateStatus(id: string, status: MentorshipStatus, respondedAt?: Date): Promise<MentorshipDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Mentorship.findByIdAndUpdate(
      id,
      { status, ...(respondedAt && { respondedAt }) },
      { new: true, runValidators: true }
    );
  }
}

export const mentorshipRepository = new MentorshipRepository();
