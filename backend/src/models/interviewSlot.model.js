import mongoose, {Schema} from "mongoose";

const interviewSlotSchema = new Schema({
    seniorId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true});

export const InterviewSlot = mongoose.model("InterviewSlot",interviewSlotSchema);