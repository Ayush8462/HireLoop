import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    skills:{
        type: [String],
        default: []
    },
    github:{
        type: String,
        default: ""
    },
    leetcode:{
        type: String,
        default: ""
    },
    linkedin:{
        type: String,
        default: ""
    },
    resumeurl:{
        type: String,
        default: ""
    },
    bio:{
        type: String,
        default: ""
    },
    readnessScore:{
        type: Number,
        default: 0
    }
})

export const StudentProfile = mongoose.model("StudentProfile", studentSchema)