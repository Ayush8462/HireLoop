import { Types } from "mongoose";

import {
  IProfile,
  Profile,
  ProfileDocument,
  ProfileRole,
} from "../models/profile.model.js";

export class ProfileRepository{

    async create(data: Omit<IProfile,"createdAt" | "updatedAt">):Promise<ProfileDocument>{
        return Profile.create(data);
    }

    async findByAuthUserId(authUserId:string):Promise<ProfileDocument | null>{
        return Profile.findOne({
            authUserId,
        }).exec();
    }

    async  findById( id:string):Promise<ProfileDocument | null>{
        if(!Types.ObjectId.isValid(id)){
            return null;
        }
        return Profile.findById(id).exec();
    }

    async updateByAuthUserId(
    authUserId: string,
    data: Partial<IProfile>,
  ): Promise<ProfileDocument | null> {
    return Profile.findOneAndUpdate(
      { authUserId },
      { $set: data },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  }

  async findAllStudentAuthUserIds(): Promise<string[]> {
    const students = await Profile.find({ role: ProfileRole.STUDENT })
      .select("authUserId")
      .lean();
    return students.map((s) => s.authUserId).filter(Boolean);
  }
}

export const profileRepository = new ProfileRepository();