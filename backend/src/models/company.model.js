import mongoose, { Schema } from "mongoose";

const companySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  roles: [String],

  avgPackage: {
    type: Number,
    default: 0
  },

  difficultyLevel: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  }
}, {timestamps: true});

export default Company = mongoose.model("Company", companySchema);