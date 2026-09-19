import { Schema, model, } from "mongoose";
export var InterviewSlotStatus;
(function (InterviewSlotStatus) {
    InterviewSlotStatus["AVAILABLE"] = "AVAILABLE";
    InterviewSlotStatus["BOOKED"] = "BOOKED";
    InterviewSlotStatus["CANCELLED"] = "CANCELLED";
})(InterviewSlotStatus || (InterviewSlotStatus = {}));
const interviewSlotSchema = new Schema({
    seniorId: {
        type: Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
        index: true,
    },
    startTime: {
        type: Date,
        required: true,
        index: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(InterviewSlotStatus),
        required: true,
        default: InterviewSlotStatus.AVAILABLE,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
interviewSlotSchema.index({
    seniorId: 1,
    startTime: 1,
});
interviewSlotSchema.index({
    seniorId: 1,
    status: 1,
    startTime: 1,
});
export const InterviewSlot = model("InterviewSlot", interviewSlotSchema);
//# sourceMappingURL=interview-slot.model.js.map