import { Schema, model } from 'mongoose';
const sessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    refreshTokenHash: {
        type: String,
        required: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
export const SessionModel = model("Session", sessionSchema);
//# sourceMappingURL=session.model.js.map