import mongoose from "mongoose";
import { env } from "./env.js";
import {logger} from "./logger.js";


export const connectDatabase = async (): Promise<void>=>{
    try{
        await mongoose.connect(env.MONGODB_URI);
        logger.info(
            {
                database:mongoose.connection.name,
                host:mongoose.connection.host,
            },
            "MongoDB connected successfully"
        )

    }catch(error){
        logger.error(error, "Error connecting to MongoDB");
        process.exit(1);
    }
}