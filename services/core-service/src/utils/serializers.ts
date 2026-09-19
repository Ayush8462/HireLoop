import { ProfileDocument, ProfileRole } from "../models/profile.model.js";

/**
 * Public profile — safe to return to ANY authenticated user.
 * Deliberately excludes: authUserId, phone (private contact info).
 */
export interface PublicProfile {
  id: string;
  role: ProfileRole;
  firstName: string;
  lastName: string;
  username?: string;
  bio?: string;
  avatar?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  companyId?: string;
  designation?: string;
  experienceYears?: number;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Private profile — returned only to the profile's owner (GET /profiles/me).
 * Adds phone number which is a private contact field.
 */
export interface PrivateProfile extends PublicProfile {
  phone?: string;
}

/**
 * Serialize a profile document to a safe public DTO.
 * Never returns authUserId — that is an internal identity boundary field.
 */
export function toPublicProfile(profile: ProfileDocument): PublicProfile {
  return {
    id: (profile._id as { toString(): string }).toString(),
    role: profile.role,
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    bio: profile.bio,
    avatar: profile.avatar,
    college: profile.college,
    degree: profile.degree,
    branch: profile.branch,
    graduationYear: profile.graduationYear,
    companyId: profile.companyId?.toString(),
    designation: profile.designation,
    experienceYears: profile.experienceYears,
    skills: profile.skills,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Serialize a profile document to a private DTO (for profile owner only).
 */
export function toPrivateProfile(profile: ProfileDocument): PrivateProfile {
  return {
    ...toPublicProfile(profile),
    phone: profile.phone,
  };
}
