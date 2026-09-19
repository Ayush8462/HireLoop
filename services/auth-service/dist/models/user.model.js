import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    role: {
        type: String,
        enum: [
            "user",
            "senior",
            "admin",
        ],
        default: "user",
        required: true,
    },
    status: {
        type: String,
        enum: [
            "active",
            "suspended",
            "deleted",
        ],
        default: "active",
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
export const UserModel = model("User", userSchema);
//# sourceMappingURL=user.model.js.map