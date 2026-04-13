import mongoose,{Schema} from "mongoose";

const referralSchema = new Schema({
  studentId:{
     type: mongoose.Schema.Types.ObjectId,
     ref:"User",
     required:true
     
  },
  seniorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  companyName:{
    type: String,
    required: true,
    trim: true
  },
  jobRole:{
   type:String,
   required:true,
  },
  resumeUrl:{
    type:String,
    default:""
  },
  message:{
    type:String,
    default:""
  },
  responseMessage:{
    type:String,
    default:""
  },
  status:{
    type:String,
    enum:["pending","approved","rejected"],
    default:"pending"
  }
},{timestamps:true});

export const Referral = mongoose.model("Referral", referralSchema);