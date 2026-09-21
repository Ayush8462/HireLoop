import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.info(`[notification-service] MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("[notification-service] Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
