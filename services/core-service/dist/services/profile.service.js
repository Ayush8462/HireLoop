import { Types } from "mongoose";
import { ProfileRole } from "../models/profile.model.js";
import { profileRepository } from "../respositories/profile.repository.js";
import { ApiError } from "../utils/api-error.js";
const authRoleToProfileRole = (authRole) => {
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
    async createProfile(authUserId, authRole, data) {
        const existingProfile = await profileRepository.findByAuthUserId(authUserId);
        if (existingProfile) {
            throw new ApiError(409, "Profile already exists");
        }
        const profileRole = data.role ?? authRoleToProfileRole(authRole);
        if (profileRole !== ProfileRole.STUDENT &&
            profileRole !== ProfileRole.SENIOR) {
            throw new ApiError(400, "Invalid profile role");
        }
        if (profileRole === ProfileRole.SENIOR &&
            !data.companyId) {
            throw new ApiError(400, "Company is required for a senior profile");
        }
        const profileData = {
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
    async getMyProfile(authUserId) {
        const profile = await profileRepository.findByAuthUserId(authUserId);
        if (!profile) {
            throw new ApiError(404, "Profile not found");
        }
        return profile;
    }
    async getProfileById(id) {
        const profile = await profileRepository.findById(id);
        if (!profile) {
            throw new ApiError(404, "Profile not found");
        }
        return profile;
    }
    async updateMyProfile(authUserId, data) {
        const existingProfile = await profileRepository.findByAuthUserId(authUserId);
        if (!existingProfile) {
            throw new ApiError(404, "Profile not found");
        }
        const { companyId, ...profileUpdateData } = data;
        const updateData = {
            ...profileUpdateData,
            ...(companyId !== undefined && {
                companyId: companyId
                    ? new Types.ObjectId(companyId)
                    : undefined,
            }),
        };
        const updatedProfile = await profileRepository.updateByAuthUserId(authUserId, updateData);
        if (!updatedProfile) {
            throw new ApiError(404, "Profile not found");
        }
        return updatedProfile;
    }
}
export const profileService = new ProfileService();
//# sourceMappingURL=profile.service.js.map