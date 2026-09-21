import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(5004),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(1, "JWT_ACCESS_SECRET is required"),

  NOTIFICATION_INTERNAL_SECRET: z
    .string()
    .min(1, "NOTIFICATION_INTERNAL_SECRET is required"),

  GMAIL_USER: z.string().email("GMAIL_USER must be a valid email"),
  GMAIL_APP_PASSWORD: z.string().min(1, "GMAIL_APP_PASSWORD is required"),

  AUTH_SERVICE_URL: z.string().url().default("http://auth-service:5001"),

  CLIENT_URL: z.string().url().default("http://localhost:5173"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsedEnv.data;
