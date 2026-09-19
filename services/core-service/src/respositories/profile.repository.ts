import { Types } from "mongoose";

import {
  IProfile,
  Profile,
  ProfileDocument,
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
}

export const profileRepository = new ProfileRepository();