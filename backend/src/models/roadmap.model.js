import mongoose, { Schema } from "mongoose";

const roadmapSchema = new Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  topics: [
    {
      title: String,
      description: String,
      resources: [String],
      difficulty: String
    }
  ],

  interviewRounds: [String],

  preparationTimeline: String
}, { timestamps: true });

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;