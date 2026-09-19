import { HydratedDocument, Model, Types } from "mongoose";
export declare enum ProfileRole {
    STUDENT = "STUDENT",
    SENIOR = "SENIOR"
}
export interface IProfile {
    authUserId: string;
    role: ProfileRole;
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
    companyId?: Types.ObjectId;
    designation?: string;
    experienceYears?: number;
    skills: string[];
    createdAt: Date;
    updatedAt: Date;
}
export type ProfileDocument = HydratedDocument<IProfile>;
export declare const Profile: Model<IProfile>;
