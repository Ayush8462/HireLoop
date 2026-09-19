import { Types } from "mongoose";
import { Profile, } from "../models/profile.model.js";
export class ProfileRepository {
    async create(data) {
        return Profile.create(data);
    }
    async findByAuthUserId(authUserId) {
        return Profile.findOne({
            authUserId,
        }).exec();
    }
    async findById(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Profile.findById(id).exec();
    }
    async updateByAuthUserId(authUserId, data) {
        return Profile.findOneAndUpdate({ authUserId }, { $set: data }, {
            new: true,
            runValidators: true,
        }).exec();
    }
}
export const profileRepository = new ProfileRepository();
//# sourceMappingURL=profile.repository.js.map