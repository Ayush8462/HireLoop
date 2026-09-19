import { Types } from 'mongoose';
import { ApiError } from '../utils/api-error.js';
import { resumeRepository } from '../respositories/resume.repository.js';
import { profileRepository } from '../respositories/profile.repository.js';
import { ProfileRole } from '../models/profile.model.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export class ResumeService {
  async createResume(authUserId: string, input: any) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found. Create a profile first.');
    if (profile.role !== ProfileRole.STUDENT) throw new ApiError(403, 'Only students can perform this action');

    const count = await resumeRepository.countByStudentId(profile._id);
    const version = count + 1;
    const isDefault = count === 0;

    const data = {
      ...input,
      studentId: profile._id,
      version,
      isDefault
    };

    return resumeRepository.create(data);
  }

  async getMyResumes(authUserId: string, query: any) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      resumeRepository.findByStudentId(profile._id, skip, limit),
      resumeRepository.countByStudentId(profile._id)
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getResumeById(authUserId: string, id: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const resume = await resumeRepository.findById(id);
    if (!resume) throw new ApiError(404, 'Resume not found');

    if (resume.studentId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'You do not own this resume');
    }

    return resume;
  }

  async updateResume(authUserId: string, id: string, data: any) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const resume = await resumeRepository.findById(id);
    if (!resume) throw new ApiError(404, 'Resume not found');

    if (resume.studentId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'You do not own this resume');
    }

    return resumeRepository.updateById(id, data);
  }

  async deleteResume(authUserId: string, id: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const resume = await resumeRepository.findById(id);
    if (!resume) throw new ApiError(404, 'Resume not found');

    if (resume.studentId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'You do not own this resume');
    }

    await resumeRepository.deleteById(id);

    if (resume.isDefault) {
      const remainingResume = await resumeRepository.findFirstByStudentId(profile._id);
      if (remainingResume) {
        await resumeRepository.setDefault(profile._id, remainingResume._id);
      }
    }
  }

  async setDefaultResume(authUserId: string, id: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const resume = await resumeRepository.findById(id);
    if (!resume) throw new ApiError(404, 'Resume not found');

    if (resume.studentId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'You do not own this resume');
    }

    await resumeRepository.setDefault(profile._id, resume._id);
    return resumeRepository.findById(id); // Return updated
  }
}

export const resumeService = new ResumeService();
