import {
  UserModel,
} from "../models/user.model.js";

export class UserRepository {

  async findByEmail(email: string) {
    return UserModel
      .findOne({ email })
      .select("+passwordHash");
  }

  async findPublicById(id: string) {
    return UserModel
      .findById(id)
      .select(
        "-passwordHash"
      );
  }

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }) {
    return UserModel.create(data);
  }

  async findById(id: string){
    return UserModel.findById(id);
  }
}