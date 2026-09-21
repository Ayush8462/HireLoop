import { Types } from "mongoose";

import { ProfileRole, IProfile } from "../models/profile.model.js";
import { Resume } from "../models/resume.model.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { uploadResumeBuffer } from "../config/cloudinary.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";

interface CreateProfileInput {
  role?: ProfileRole;

  firstName: string;
  lastName: string;

  username?: string;
  bio?: string;
  phone?: string;
  avatar?: string;

  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;

  companyId?: string;
  designation?: string;
  experienceYears?: number;

  skills?: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  atsScore?: number;
}

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  companyId?: string;
  designation?: string;
  experienceYears?: number;
  skills?: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  atsScore?: number;
}

const authRoleToProfileRole = (
  authRole: string,
): ProfileRole | undefined => {
  const normalizedRole = authRole.trim().toLowerCase();

  if (normalizedRole === "user") {
    return ProfileRole.STUDENT;
  }

  if (normalizedRole === "senior") {
    return ProfileRole.SENIOR;
  }

  return undefined;
};

export class ProfileService {
  async createProfile(
  authUserId: string,
  authRole: string,
  data: CreateProfileInput,
) {
  const existingProfile =
    await profileRepository.findByAuthUserId(
      authUserId,
    );

  if (existingProfile) {
    throw new ApiError(
      409,
      "Profile already exists",
    );
  }

  const profileRole =
    data.role ?? authRoleToProfileRole(authRole);

  if (
    profileRole !== ProfileRole.STUDENT &&
    profileRole !== ProfileRole.SENIOR
  ) {
    throw new ApiError(
      400,
      "Invalid profile role",
    );
  }

  if (
    profileRole === ProfileRole.SENIOR &&
    !data.companyId
  ) {
    throw new ApiError(
      400,
      "Company is required for a senior profile",
    );
  }

  const profileData: Omit<
    IProfile,
    "createdAt" | "updatedAt"
  > = {
    authUserId,

    role: profileRole,

    firstName: data.firstName,
    lastName: data.lastName,

    username: data.username,
    bio: data.bio,
    phone: data.phone,
    avatar: data.avatar,

    college: data.college,
    degree: data.degree,
    branch: data.branch,
    graduationYear: data.graduationYear,

    companyId: data.companyId
      ? new Types.ObjectId(data.companyId)
      : undefined,

    designation: data.designation,
    experienceYears: data.experienceYears,

    skills: data.skills ?? [],

    resumeUrl: data.resumeUrl,
    resumeFileName: data.resumeFileName,
    atsScore: data.atsScore,
  };

  return profileRepository.create(profileData);
}

  async getMyProfile(authUserId: string) {
    const profile = await profileRepository.findByAuthUserId(authUserId);

    if (!profile) {
      throw new ApiError(404, "Profile not found");
    }

    return profile;
  }

  async getProfileById(id: string) {
    const profile = await profileRepository.findById(id);

    if (!profile) {
      throw new ApiError(404, "Profile not found");
    }

    return profile;
  }

  async updateMyProfile(
  authUserId: string,
  data: UpdateProfileInput,
) {
  const existingProfile =
    await profileRepository.findByAuthUserId(authUserId);

  if (!existingProfile) {
    throw new ApiError(
      404,
      "Profile not found",
    );
  }

  const {
    companyId,
    ...profileUpdateData
  } = data;

  const updateData: Partial<IProfile> = {
    ...profileUpdateData,

    ...(companyId !== undefined && {
      companyId: companyId
        ? new Types.ObjectId(companyId)
        : undefined,
    }),
  };

  const updatedProfile =
    await profileRepository.updateByAuthUserId(
      authUserId,
      updateData,
    );

  if (!updatedProfile) {
    throw new ApiError(
      404,
      "Profile not found",
    );
  }

  return updatedProfile;
}

  async uploadResume(
    authUserId: string,
    file: Express.Multer.File,
  ) {
    const profile = await profileRepository.findByAuthUserId(authUserId);
    if (!profile) {
      throw new ApiError(404, "Profile not found. Please create a profile first.");
    }

    if (!file || !file.buffer) {
      throw new ApiError(400, "No resume file uploaded");
    }

    if (file.mimetype !== "application/pdf") {
      throw new ApiError(400, "Only PDF files are supported");
    }

    // 1. Upload to Cloudinary
    const uploadResult = await uploadResumeBuffer(file.buffer, file.originalname);

    // 2. Compute ATS score if ATS service is available
    let atsScore: number | undefined;
    try {
      const atsServiceUrl = process.env.ATS_SERVICE_URL || "http://ats-service:5003";
      const response = await fetch(`${atsServiceUrl}/score-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadResult.secure_url }),
      });
      if (response.ok) {
        const atsData = (await response.json()) as { success: boolean; data?: { score?: number } };
        if (atsData.success && typeof atsData.data?.score === "number") {
          atsScore = atsData.data.score;
        }
      }
    } catch (atsErr) {
      logger.warn({ atsErr }, "Optional ATS scoring failed during resume upload");
    }

    // 3. Update Profile
    const updatedProfile = await profileRepository.updateByAuthUserId(authUserId, {
      resumeUrl: uploadResult.secure_url,
      resumeFileName: file.originalname,
      ...(atsScore !== undefined && { atsScore }),
    });

    // 4. Save to Resume history collection
    try {
      const existingResumes = await Resume.find({ studentId: profile._id })
        .sort({ version: -1 })
        .limit(1);
      const version = existingResumes.length > 0 ? existingResumes[0].version + 1 : 1;
      await Resume.updateMany({ studentId: profile._id }, { isDefault: false });
      await Resume.create({
        studentId: profile._id,
        fileName: file.originalname,
        fileUrl: uploadResult.secure_url,
        version,
        isDefault: true,
      });
    } catch (histErr) {
      logger.warn({ histErr }, "Failed to record resume version history");
    }

    return {
      resumeUrl: uploadResult.secure_url,
      resumeFileName: file.originalname,
      atsScore,
      profile: updatedProfile,
    };
  }
}

export const profileService = new ProfileService();
