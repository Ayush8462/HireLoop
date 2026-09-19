import { Types } from "mongoose";

import { ProfileRole, IProfile } from "../models/profile.model.js";

import { profileRepository } from "../respositories/profile.repository.js";

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
}

export const profileService = new ProfileService();
