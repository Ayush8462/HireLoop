import { Schema, model, } from "mongoose";
export var MentorshipStatus;
(function (MentorshipStatus) {
    MentorshipStatus["PENDING"] = "PENDING";
    MentorshipStatus["ACCEPTED"] = "ACCEPTED";
    MentorshipStatus["REJECTED"] = "REJECTED";
    MentorshipStatus["CANCELLED"] = "CANCELLED";
    MentorshipStatus["COMPLETED"] = "COMPLETED";
})(MentorshipStatus || (MentorshipStatus = {}));
const mentorshipSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
        index: true,
    },
    seniorId: {
        type: Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
        index: true,
    },
    message: {
        type: String,
        trim: true,
        maxlength: 2000,
    },
    status: {
        type: String,
        enum: Object.values(MentorshipStatus),
        required: true,
        default: MentorshipStatus.PENDING,
        index: true,
    },
    startedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});
mentorshipSchema.index({
    studentId: 1,
    seniorId: 1,
});
mentorshipSchema.index({
    seniorId: 1,
    status: 1,
});
export const Mentorship = model("Mentorship", mentorshipSchema);
//# sourceMappingURL=mentorship.model.js.map