import { Schema, model } from "mongoose";
export var ProfileRole;
(function (ProfileRole) {
    ProfileRole["STUDENT"] = "STUDENT";
    ProfileRole["SENIOR"] = "SENIOR";
})(ProfileRole || (ProfileRole = {}));
const profileSchema = new Schema({
    authUserId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    role: {
        type: String,
        enum: Object.values(ProfileRole),
        required: true,
        index: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 30,
    },
    avatar: {
        type: String,
        trim: true,
        maxlength: 2048,
    },
    college: {
        type: String,
        trim: true,
        maxlength: 200,
    },
    degree: {
        type: String,
        trim: true,
        maxlength: 150,
    },
    branch: {
        type: String,
        trim: true,
        maxlength: 150,
    },
    graduationYear: {
        type: Number,
        min: 1950,
        max: 2100,
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        index: true,
    },
    designation: {
        type: String,
        trim: true,
        maxlength: 150,
    },
    experienceYears: {
        type: Number,
        min: 0,
        max: 100,
    },
    skills: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
    versionKey: false,
});
profileSchema.index({ username: 1 }, {
    unique: true,
    sparse: true,
});
profileSchema.index({
    role: 1,
    companyId: 1,
});
export const Profile = model("Profile", profileSchema);
//# sourceMappingURL=profile.model.js.map