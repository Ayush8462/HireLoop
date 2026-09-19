import { Types } from "mongoose";
import { referralRepository } from "../respositories/referral.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
<<<<<<< HEAD
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
=======
import { companyRepository } from "../respositories/company.repository.js";
import { ApiError } from "../utils/api-error.js";
import { ReferralStatus } from "../models/referral.model.js";

interface RequestReferralInput {
  seniorId: string;
  companyId: string;
  jobTitle: string;
  jobUrl?: string;
  message?: string;
}

export class ReferralService {
  async requestReferral(authUserId: string, data: RequestReferralInput) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) {
      throw new ApiError(404, "Student profile not found. Please create a profile first.");
    }

    if (!Types.ObjectId.isValid(data.seniorId)) {
      throw new ApiError(400, "Invalid senior profile ID");
    }

    if (!Types.ObjectId.isValid(data.companyId)) {
      throw new ApiError(400, "Invalid company ID");
    }

    const seniorObjectId = new Types.ObjectId(data.seniorId);
    const companyObjectId = new Types.ObjectId(data.companyId);

    if (studentProfile._id.equals(seniorObjectId)) {
      throw new ApiError(400, "You cannot request a referral from yourself");
    }

    const seniorProfile = await profileRepository.findById(data.seniorId);
    if (!seniorProfile) {
      throw new ApiError(404, "Senior profile not found");
    }

    const company = await companyRepository.findById(data.companyId);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const todayCount = await referralRepository.countTodayByStudentId(studentProfile._id);
    if (todayCount >= 5) {
      throw new ApiError(400, "Daily referral limit of 5 requests reached. Try again tomorrow.");
    }

    const existing = await referralRepository.findExistingPending(
      studentProfile._id,
      seniorObjectId,
      companyObjectId,
      data.jobTitle
    );

    if (existing) {
      throw new ApiError(409, "You have already submitted a pending referral request for this position");
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
    }

    return referralRepository.create({
      studentId: studentProfile._id,
<<<<<<< HEAD
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
=======
      seniorId: seniorObjectId,
      companyId: companyObjectId,
      jobTitle: data.jobTitle,
      jobUrl: data.jobUrl,
      message: data.message,
      status: ReferralStatus.PENDING,
    });
  }

  async updateStatus(
    authUserId: string,
    referralId: string,
    status: ReferralStatus
  ) {
    if (!Types.ObjectId.isValid(referralId)) {
      throw new ApiError(400, "Invalid referral ID");
    }

    const referral = await referralRepository.findById(referralId);
    if (!referral) {
      throw new ApiError(404, "Referral request not found");
    }

    const userProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!userProfile) {
      throw new ApiError(404, "User profile not found");
    }

    // Only the assigned senior can accept/reject/submit
    if (
      (status === ReferralStatus.ACCEPTED ||
        status === ReferralStatus.REJECTED ||
        status === ReferralStatus.SUBMITTED) &&
      !referral.seniorId._id.equals(userProfile._id)
    ) {
      throw new ApiError(403, "Only the assigned senior can review this referral");
    }

    // Only the student can cancel
    if (status === ReferralStatus.CANCELLED && !referral.studentId._id.equals(userProfile._id)) {
      throw new ApiError(403, "Only the requester can cancel this referral request");
    }

    return referralRepository.updateStatus(referralId, status);
  }

  async getMySentReferrals(authUserId: string, status?: ReferralStatus) {
    const studentProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!studentProfile) {
      throw new ApiError(404, "Profile not found");
    }

    return referralRepository.findByStudentId(studentProfile._id, status);
  }

  async getMyReceivedReferrals(authUserId: string, status?: ReferralStatus) {
    const seniorProfile = await profileRepository.findByAuthUserId(authUserId);
    if (!seniorProfile) {
      throw new ApiError(404, "Profile not found");
    }

    return referralRepository.findBySeniorId(seniorProfile._id, status);
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }
}

export const referralService = new ReferralService();
