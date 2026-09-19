import { Types } from "mongoose";
import { referralRepository } from "../respositories/referral.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
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
    }

    return referralRepository.create({
      studentId: studentProfile._id,
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
  }
}

export const referralService = new ReferralService();
