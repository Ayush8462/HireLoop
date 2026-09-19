import { UserModel } from "../models/user.model.js";
export class UserRepository {
    async findByEmail(email) {
        return UserModel
            .findOne({ email })
            .select("+passwordHash");
    }
    async findPublicById(id) {
        return UserModel
            .findById(id)
            .select("-passwordHash");
    }
    async create(data) {
        return UserModel.create(data);
    }
    async findById(id) {
        return UserModel.findById(id);
    }
}
//# sourceMappingURL=user.repository.js.map