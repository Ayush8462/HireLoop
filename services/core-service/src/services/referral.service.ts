import { Types } from "mongoose";
import { referralRepository } from "../respositories/referral.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { ApiError } from "../utils/api-error.js";
import { ReferralStatus } from "../models/referral.model.js";
import { ProfileRole } from "../models/profile.model.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

class ReferralService {
  async requestReferral(authUserId: string, input: { seniorId: string; companyId: string; jobTitle: string; jobUrl?: string; message?: string }) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) throw new ApiError(404, "Create a profile first");
    if (studentProfile.role !== ProfileRole.STUDENT) throw new ApiError(403, "Only students can request referrals");

    const seniorProfile = await profileRepository.findById(input.seniorId);
    if (!seniorProfile) throw new ApiError(404, "Senior not found");
    if (seniorProfile.role !== ProfileRole.SENIOR) throw new ApiError(400, "Target user is not a senior");

    if (studentProfile._id.toString() === seniorProfile._id.toString()) {
      throw new ApiError(400, "Cannot request referral from yourself");
    }

    if (!seniorProfile.companyId || seniorProfile.companyId.toString() !== input.companyId) {
      throw new ApiError(400, "The senior does not work at the requested company");
    }

    return referralRepository.create({
      studentId: studentProfile._id,
      seniorId: seniorProfile._id,
      companyId: new Types.ObjectId(input.companyId),
      jobTitle: input.jobTitle,
      jobUrl: input.jobUrl,
      message: input.message,
    });
  }

  async getSentReferrals(authUserId: string, query: any) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) throw new ApiError(404, "Profile not found");

    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      referralRepository.findSentByStudent(studentProfile._id, skip, limit),
      referralRepository.countSentByStudent(studentProfile._id),
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getReceivedReferrals(authUserId: string, query: any) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) throw new ApiError(404, "Profile not found");

    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      referralRepository.findReceivedBySenior(seniorProfile._id, skip, limit),
      referralRepository.countReceivedBySenior(seniorProfile._id),
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getReferralById(authUserId: string, id: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) throw new ApiError(404, "Profile not found");

    const referral = await referralRepository.findById(id);
    if (!referral) throw new ApiError(404, "Referral not found");

    if (referral.studentId.toString() !== profile._id.toString() && referral.seniorId.toString() !== profile._id.toString()) {
      throw new ApiError(403, "You do not have permission to view this referral");
    }

    return referral;
  }

  async acceptReferral(authUserId: string, id: string, responseMessage?: string) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) throw new ApiError(404, "Profile not found");
    if (seniorProfile.role !== ProfileRole.SENIOR) throw new ApiError(403, "Only seniors can accept referrals");

    const referral = await referralRepository.findById(id);
    if (!referral) throw new ApiError(404, "Referral not found");

    if (referral.seniorId.toString() !== seniorProfile._id.toString()) {
      throw new ApiError(403, "You can only accept referrals addressed to you");
    }

    if (referral.status !== ReferralStatus.PENDING) {
      throw new ApiError(409, `Cannot accept a referral with status ${referral.status}`);
    }

    return referralRepository.updateStatus(id, ReferralStatus.ACCEPTED, responseMessage);
  }

  async rejectReferral(authUserId: string, id: string, responseMessage?: string) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) throw new ApiError(404, "Profile not found");
    if (seniorProfile.role !== ProfileRole.SENIOR) throw new ApiError(403, "Only seniors can reject referrals");

    const referral = await referralRepository.findById(id);
    if (!referral) throw new ApiError(404, "Referral not found");

    if (referral.seniorId.toString() !== seniorProfile._id.toString()) {
      throw new ApiError(403, "You can only reject referrals addressed to you");
    }

    if (referral.status !== ReferralStatus.PENDING) {
      throw new ApiError(409, `Cannot reject a referral with status ${referral.status}`);
    }

    return referralRepository.updateStatus(id, ReferralStatus.REJECTED, responseMessage);
  }

  async cancelReferral(authUserId: string, id: string) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) throw new ApiError(404, "Profile not found");
    if (studentProfile.role !== ProfileRole.STUDENT) throw new ApiError(403, "Only students can cancel referrals");

    const referral = await referralRepository.findById(id);
    if (!referral) throw new ApiError(404, "Referral not found");

    if (referral.studentId.toString() !== studentProfile._id.toString()) {
      throw new ApiError(403, "You can only cancel your own referrals");
    }

    if (referral.status !== ReferralStatus.PENDING) {
      throw new ApiError(409, `Cannot cancel a referral with status ${referral.status}`);
    }

    return referralRepository.updateStatus(id, ReferralStatus.CANCELLED);
  }
}

export const referralService = new ReferralService();
