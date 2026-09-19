import { Schema, model, } from "mongoose";
export var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["PENDING"] = "PENDING";
    ReferralStatus["ACCEPTED"] = "ACCEPTED";
    ReferralStatus["REJECTED"] = "REJECTED";
    ReferralStatus["SUBMITTED"] = "SUBMITTED";
    ReferralStatus["COMPLETED"] = "COMPLETED";
    ReferralStatus["CANCELLED"] = "CANCELLED";
})(ReferralStatus || (ReferralStatus = {}));
const referralSchema = new Schema({
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
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true,
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    jobUrl: {
        type: String,
        trim: true,
        maxlength: 2048,
    },
    message: {
        type: String,
        trim: true,
        maxlength: 2000,
    },
    status: {
        type: String,
        enum: Object.values(ReferralStatus),
        required: true,
        default: ReferralStatus.PENDING,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
referralSchema.index({
    studentId: 1,
    companyId: 1,
    status: 1,
});
referralSchema.index({
    seniorId: 1,
    status: 1,
});
export const Referral = model("Referral", referralSchema);
//# sourceMappingURL=referral.model.js.map