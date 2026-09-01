import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce
    .number()
    .positive()
    .default(5001),
  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is required"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  ACCESS_TOKEN_EXPIRES_IN: z
    .string()
    .default("15m"),

  REFRESH_TOKEN_EXPIRES_IN: z
    .string()
    .default("7d"),

  FRONTEND_URL: z
    .string()
    .url(),

  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),

  COOKIE_DOMAIN: z
    .string()
    .optional(),

  LOG_LEVEL: z
    .string()
    .default("info")
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment configuration");

  console.error(
    result.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const env = result.data;
