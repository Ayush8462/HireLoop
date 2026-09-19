import { Types } from 'mongoose';
import { Resume, IResume, ResumeDocument } from '../models/resume.model.js';

export class ResumeRepository {
  async create(data: Omit<IResume, 'createdAt' | 'updatedAt'>): Promise<ResumeDocument> {
    const resume = new Resume(data);
    return resume.save();
  }

  async findById(id: string): Promise<ResumeDocument | null> {
    return Resume.findById(id).exec();
  }

  async findByStudentId(studentId: Types.ObjectId, skip: number, limit: number): Promise<ResumeDocument[]> {
    return Resume.find({ studentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByStudentId(studentId: Types.ObjectId): Promise<number> {
    return Resume.countDocuments({ studentId }).exec();
  }

  async findDefaultByStudentId(studentId: Types.ObjectId): Promise<ResumeDocument | null> {
    return Resume.findOne({ studentId, isDefault: true }).exec();
  }

  async updateById(id: string, data: Partial<IResume>): Promise<ResumeDocument | null> {
    return Resume.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await Resume.findByIdAndDelete(id).exec();
  }

  async setDefault(studentId: Types.ObjectId, resumeId: Types.ObjectId): Promise<void> {
    await Resume.updateMany({ studentId, isDefault: true }, { $set: { isDefault: false } }).exec();
    await Resume.findOneAndUpdate({ _id: resumeId, studentId }, { $set: { isDefault: true } }).exec();
  }

  async findFirstByStudentId(studentId: Types.ObjectId): Promise<ResumeDocument | null> {
    return Resume.findOne({ studentId }).sort({ createdAt: -1 }).exec();
  }
}

export const resumeRepository = new ResumeRepository();
