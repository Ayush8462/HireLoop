import httpStatus from "http-status";
import { StudentProfile } from "../models/studentprofile.model";

const CreateProfile=async(req,res)=>{
    try{
        const existing=await StudentProfile.findOne({userId:req.user.id});
        if(existing){
            return res.status(httpStatus.FOUND).json({message:"Profile already exists"})
        }
        const profile=new StudentProfile({
            userId:req.user.id,
            skills:req.body.skills,
            github:req.body.github,
            leetcode:req.body.leetcode,
            linkedin:req.body.linkedin,
            resumeurl:req.body.resumeurl,
            readnessScore:req.body.readnessScore,
            bio:req.body.bio
        });
        await profile.save();
        res.status(httpStatus.CREATED).json({message: "Profile created Successfully"})
    }
    catch(err){
    res.json({message: `Something went wrong ${err}`});
  }
}

const GetProfile=async(req,res)=>{
    try{
        const profile=await StudentProfile.findOne({userId:req.user.id}).populate("userId","name email role")
        if(!profile){
            return res.status(httpStatus.NOT_FOUND).json({message:"Profile Not Found"})
        }
        res.json(profile)
    }catch(err){
        res.json({message: `Something went wrong ${err}`});
    }
}

const UpdateProfile=async(req,res)=>{
    try{
        const updated=await StudentProfile.findOneAndUpdate(
            {userId:req.user.id},
            req.body,
            {new:true, runValidators:true}
        )
        if(!updated){
            return res.status(httpStatus.NOT_FOUND).json({message:"Profile Not Found"})
        }
        res.json(updated)
    }   
    catch(err){
        res.json({message: `Something went wrong ${err}`});
    }
}

export { CreateProfile, GetProfile, UpdateProfile }