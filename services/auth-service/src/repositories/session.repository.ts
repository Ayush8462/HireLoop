import { Types } from "mongoose";

import { SessionModel } from "../models/session.model.js";

export class SessionRepository {
  async create(data: {
    userId: string;
    expiresAt: Date;
  }) {
    return SessionModel.create({
      userId: new Types.ObjectId(data.userId),
      expiresAt: data.expiresAt,
    });
  }

  async updateRefreshToken(sessionId: string, refreshTokenHash: string) {
    return SessionModel.findByIdAndUpdate(
      sessionId,
      {
        refreshTokenHash,
      },
      {
        new: true,
      },
    );
  }

  async findById(id: String) {
    return SessionModel.findById(id);
  }

  async deleteById(id: string) {
    return SessionModel.findByIdAndDelete(id);
  }

  async deleteAllByUserId(userId: string) {
    return SessionModel.deleteMany({
      userId,
    });
  }
}
