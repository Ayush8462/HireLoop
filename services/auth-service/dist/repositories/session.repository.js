import { Types } from "mongoose";
import { SessionModel } from "../models/session.model.js";
export class SessionRepository {
    async create(data) {
        return SessionModel.create({
            userId: new Types.ObjectId(data.userId),
            expiresAt: data.expiresAt,
        });
    }
    async updateRefreshToken(sessionId, refreshTokenHash) {
        return SessionModel.findByIdAndUpdate(sessionId, {
            refreshTokenHash,
        }, {
            new: true,
        });
    }
    async findById(id) {
        return SessionModel.findById(id);
    }
    async deleteById(id) {
        return SessionModel.findByIdAndDelete(id);
    }
    async deleteAllByUserId(userId) {
        return SessionModel.deleteMany({
            userId,
        });
    }
}
//# sourceMappingURL=session.repository.js.map