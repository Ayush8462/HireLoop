import { Schema, model, } from "mongoose";
export var InterviewBookingStatus;
(function (InterviewBookingStatus) {
    InterviewBookingStatus["CONFIRMED"] = "CONFIRMED";
    InterviewBookingStatus["COMPLETED"] = "COMPLETED";
    InterviewBookingStatus["CANCELLED"] = "CANCELLED";
    InterviewBookingStatus["NO_SHOW"] = "NO_SHOW";
})(InterviewBookingStatus || (InterviewBookingStatus = {}));
const interviewBookingSchema = new Schema({
    slotId: {
        type: Schema.Types.ObjectId,
        ref: "InterviewSlot",
        required: true,
        unique: true,
        index: true,
    },
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
    status: {
        type: String,
        enum: Object.values(InterviewBookingStatus),
        required: true,
        default: InterviewBookingStatus.CONFIRMED,
        index: true,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 2000,
    },
}, {
    timestamps: true,
    versionKey: false,
});
interviewBookingSchema.index({
    studentId: 1,
    status: 1,
});
interviewBookingSchema.index({
    seniorId: 1,
    status: 1,
});
export const InterviewBooking = model("InterviewBooking", interviewBookingSchema);
//# sourceMappingURL=interview-booking.model.js.map