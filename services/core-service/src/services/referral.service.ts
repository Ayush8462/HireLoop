import { Types } from "mongoose";
import { referralRepository } from "../respositories/referral.repository.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { companyRepository } from "../respositories/company.repository.js";
import { ApiError } from "../utils/api-error.js";
import { ReferralStatus } from "../models/referral.model.js";
import { notificationClient } from "./notification-client.service.js";
import { NotificationType } from "./notification-client.service.js";

interface RequestReferralInput {
  seniorId: string;
  companyId: string;
  jobTitle: string;
  jobUrl?: string;
  message?: string;
  resumeUrl?: string;
  resumeFileName?: string;
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

    const referral = await referralRepository.create({
      studentId: studentProfile._id,
      seniorId: seniorObjectId,
      companyId: companyObjectId,
      jobTitle: data.jobTitle,
      jobUrl: data.jobUrl,
      message: data.message,
      resumeUrl: data.resumeUrl || studentProfile.resumeUrl,
      resumeFileName: data.resumeFileName || studentProfile.resumeFileName,
      status: ReferralStatus.PENDING,
    });

    // Notify senior about the new referral request (fire-and-forget)
    notificationClient.fireReferralEvent({
      type: NotificationType.REFERRAL_REQUEST,
      referralId: referral._id.toString(),
      jobTitle: data.jobTitle,
      companyName: company.name,
      studentAuthUserId: authUserId,
      seniorAuthUserId: seniorProfile.authUserId,
      studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
      seniorName: `${seniorProfile.firstName} ${seniorProfile.lastName}`,
    });

    return referral;
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

    const updatedReferral = await referralRepository.updateStatus(referralId, status);

    // Determine notification type and fetch profiles for names
    let notifType: string | null = null;
    if (status === ReferralStatus.ACCEPTED) notifType = NotificationType.REFERRAL_ACCEPTED;
    else if (status === ReferralStatus.REJECTED) notifType = NotificationType.REFERRAL_REJECTED;
    else if (status === ReferralStatus.SUBMITTED) notifType = NotificationType.REFERRAL_SUBMITTED;
    else if (status === ReferralStatus.CANCELLED) notifType = NotificationType.REFERRAL_CANCELLED;

    if (notifType) {
      // We need both profiles to get names and authUserIds
      const [studentProfile, seniorProfile] = await Promise.all([
        profileRepository.findById(referral.studentId._id.toString()),
        profileRepository.findById(referral.seniorId._id.toString()),
      ]);

      if (studentProfile && seniorProfile) {
        // For CANCELLED: notify senior. For everything else: notify student.
        const studentAuthUserId = studentProfile.authUserId;
        const seniorAuthUserId = seniorProfile.authUserId;

        notificationClient.fireReferralEvent({
          type: notifType,
          referralId,
          jobTitle: referral.jobTitle,
          companyName: "",  // company name not stored on referral, use jobTitle as context
          studentAuthUserId,
          seniorAuthUserId,
          studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
          seniorName: `${seniorProfile.firstName} ${seniorProfile.lastName}`,
        });
      }
    }

    return updatedReferral;
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
