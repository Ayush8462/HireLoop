import { Types } from "mongoose";
import { mentorshipRepository } from "../respositories/mentorship.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { ApiError } from "../utils/api-error.js";
import { MentorshipStatus } from "../models/mentorship.model.js";
import { ProfileRole } from "../models/profile.model.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

class MentorshipService {
  async sendRequest(authUserId: string, input: { seniorId: string; message?: string }) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) throw new ApiError(404, "Create a profile first");
    if (studentProfile.role !== ProfileRole.STUDENT) throw new ApiError(403, "Only students can send mentorship requests");

    const seniorProfile = await profileRepository.findById(input.seniorId);
    if (!seniorProfile) throw new ApiError(404, "Senior not found");
    if (seniorProfile.role !== ProfileRole.SENIOR) throw new ApiError(400, "Target user is not a senior");

    if (studentProfile._id.toString() === seniorProfile._id.toString()) {
      throw new ApiError(400, "Cannot send mentorship request to yourself");
    }

    const existing = await mentorshipRepository.findPendingBetween(studentProfile._id, seniorProfile._id);
    if (existing) throw new ApiError(409, "You already have a pending mentorship request with this senior");

    return mentorshipRepository.create({
      studentId: studentProfile._id,
      seniorId: seniorProfile._id,
      message: input.message,
    });
  }

  async getSentRequests(authUserId: string, query: any) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) throw new ApiError(404, "Profile not found");
    
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      mentorshipRepository.findSentByStudent(studentProfile._id, skip, limit),
      mentorshipRepository.countSentByStudent(studentProfile._id),
    ]);
    
    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getReceivedRequests(authUserId: string, query: any) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) throw new ApiError(404, "Profile not found");
    
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      mentorshipRepository.findReceivedBySenior(seniorProfile._id, skip, limit),
      mentorshipRepository.countReceivedBySenior(seniorProfile._id),
    ]);
    
    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async acceptRequest(authUserId: string, requestId: string) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) throw new ApiError(404, "Profile not found");
    if (seniorProfile.role !== ProfileRole.SENIOR) throw new ApiError(403, "Only seniors can accept mentorship requests");

    const request = await mentorshipRepository.findById(requestId);
    if (!request) throw new ApiError(404, "Mentorship request not found");

    if (request.seniorId.toString() !== seniorProfile._id.toString()) {
      throw new ApiError(403, "You can only accept requests sent to you");
    }

    if (request.status !== MentorshipStatus.PENDING) {
      throw new ApiError(409, `Cannot accept a request with status ${request.status}`);
    }

    return mentorshipRepository.updateStatus(requestId, MentorshipStatus.ACCEPTED, new Date());
  }

  async rejectRequest(authUserId: string, requestId: string) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) throw new ApiError(404, "Profile not found");
    if (seniorProfile.role !== ProfileRole.SENIOR) throw new ApiError(403, "Only seniors can reject mentorship requests");

    const request = await mentorshipRepository.findById(requestId);
    if (!request) throw new ApiError(404, "Mentorship request not found");

    if (request.seniorId.toString() !== seniorProfile._id.toString()) {
      throw new ApiError(403, "You can only reject requests sent to you");
    }

    if (request.status !== MentorshipStatus.PENDING) {
      throw new ApiError(409, `Cannot reject a request with status ${request.status}`);
    }

    return mentorshipRepository.updateStatus(requestId, MentorshipStatus.REJECTED, new Date());
  }

  async cancelRequest(authUserId: string, requestId: string) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) throw new ApiError(404, "Profile not found");
    if (studentProfile.role !== ProfileRole.STUDENT) throw new ApiError(403, "Only students can cancel mentorship requests");

    const request = await mentorshipRepository.findById(requestId);
    if (!request) throw new ApiError(404, "Mentorship request not found");

    if (request.studentId.toString() !== studentProfile._id.toString()) {
      throw new ApiError(403, "You can only cancel your own requests");
    }

    if (request.status !== MentorshipStatus.PENDING) {
      throw new ApiError(409, `Cannot cancel a request with status ${request.status}`);
    }

    return mentorshipRepository.updateStatus(requestId, MentorshipStatus.CANCELLED);
  }

  async getConnections(authUserId: string, query: any) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, "Profile not found");

    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      mentorshipRepository.findConnections(profile._id, skip, limit),
      mentorshipRepository.countConnections(profile._id),
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }
}

export const mentorshipService = new MentorshipService();
