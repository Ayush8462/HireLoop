import { IProfile, ProfileDocument } from "../models/profile.model.js";
export declare class ProfileRepository {
    create(data: Omit<IProfile, "createdAt" | "updatedAt">): Promise<ProfileDocument>;
    findByAuthUserId(authUserId: string): Promise<ProfileDocument | null>;
    findById(id: string): Promise<ProfileDocument | null>;
    updateByAuthUserId(authUserId: string, data: Partial<IProfile>): Promise<ProfileDocument | null>;
}
export declare const profileRepository: ProfileRepository;
