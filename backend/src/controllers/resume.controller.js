import cloudinary from "../config/cloudinary.js";
import {StudentProfile} from "../models/StudentProfile.model.js";

import extractText from "../services/resumeParse.js";
import calculateAts from "../services/atsService.js";

import streamifier from "streamifier";

const uploadResume = async(req , res)=>{
    try {
        if(!req.file){
            return res
                .status(400)
                .json(
                    {msg:"No file uploaded"}
                )
        }


        const resumeText = await extractText(
            req.file.buffer
        )

        const atsScore = calculateAts(resumeText);

        // Upload file to Cloudinary

        const streamUpload = ()=>{
            return new Promise((resolve,reject)=>{
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type:"raw",
                        folder:"resumes"
                    },
                    (error,result)=>{
                        if(result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier
                    .createReadStream(req.file.buffer)
                    .pipe(stream)
            })
        }

        const result = await streamUpload();

        const profile = await StudentProfile.findOneAndUpdate(
            {userId:req.user.id},
            {
                resumeurl:result.secure_url,
                readnessScore:atsScore
            }
        );

        if (!profile) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        res.json({
            resumeUrl:result.secure_url,
            atsScore
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:error.message
        });
    }
}

export default uploadResume;

