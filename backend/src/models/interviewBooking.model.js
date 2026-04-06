import mongoose, { Schema } from "mongoose";

const interviewBookingSchema = new Schema({
    studentId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    seniorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    slotId: {
        type: Schema.Types.ObjectId,
        ref: "InterviewSlot",
        required: true
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled"
    },
    feedback: {
         technicalRating: { type: Number, min: 1, max: 5, default: null },
        communicationRating: { type: Number, min: 1, max: 5, default: null },
        problemSolvingRating: { type: Number, min: 1, max: 5, default: null },
        strengths: { type: String, default: "" },
        improvements: { type: String, default: "" }
    }
}, { timestamps: true });

export const InterviewBooking = mongoose.model("InterviewBooking",interviewBookingSchema)