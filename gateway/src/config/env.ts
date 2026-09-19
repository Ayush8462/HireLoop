import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "AUTH_SERVICE_URL",
  "CORE_SERVICE_URL",
  "ATS_SERVICE_URL",
  "NOTIFICATION_SERVICE_URL"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  services: {
    auth: process.env.AUTH_SERVICE_URL as string,
    core: process.env.CORE_SERVICE_URL as string,
    ats: process.env.ATS_SERVICE_URL as string,
    notification: process.env.NOTIFICATION_SERVICE_URL as string
  }
};