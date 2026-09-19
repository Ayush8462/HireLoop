import { Types } from "mongoose";
import { ProfileRole, IProfile } from "../models/profile.model.js";
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
export declare class ProfileService {
    createProfile(authUserId: string, authRole: string, data: CreateProfileInput): Promise<import("mongoose").Document<unknown, {}, IProfile, {}, import("mongoose").DefaultSchemaOptions> & IProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyProfile(authUserId: string): Promise<import("mongoose").Document<unknown, {}, IProfile, {}, import("mongoose").DefaultSchemaOptions> & IProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getProfileById(id: string): Promise<import("mongoose").Document<unknown, {}, IProfile, {}, import("mongoose").DefaultSchemaOptions> & IProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    updateMyProfile(authUserId: string, data: UpdateProfileInput): Promise<import("mongoose").Document<unknown, {}, IProfile, {}, import("mongoose").DefaultSchemaOptions> & IProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare const profileService: ProfileService;
export {};
