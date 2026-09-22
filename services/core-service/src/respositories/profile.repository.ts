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
        }).populate("companyId").exec();
    }

    async  findById( id:string):Promise<ProfileDocument | null>{
        if(!Types.ObjectId.isValid(id)){
            return null;
        }
        return Profile.findById(id).populate("companyId").exec();
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
    ).populate("companyId").exec();
  }

  async findAllStudentAuthUserIds(): Promise<string[]> {
    const students = await Profile.find({ role: ProfileRole.STUDENT })
      .select("authUserId")
      .lean();
    return students.map((s) => s.authUserId).filter(Boolean);
  }

  async findSeniors(companyId?: string): Promise<ProfileDocument[]> {
    const query: Record<string, unknown> = {
      role: ProfileRole.SENIOR,
    };
    if (companyId) {
      if (Types.ObjectId.isValid(companyId)) {
        query.companyId = new Types.ObjectId(companyId);
      } else {
        query.companyId = companyId;
      }
    }
    return Profile.find(query)
      .populate("companyId")
      .sort({ firstName: 1, lastName: 1 })
      .exec();
  }
}

export const profileRepository = new ProfileRepository();