import mongoose from "mongoose";
import {env} from "./env.js";
import { error } from "console";


export async function connectDatabase():Promise<void>{
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log("✅ MongoDB connected successfully");
    }catch(error){
        console.error(" MongoDB connection failed:", error);
        process.exit(1);
    }
}
