import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js"
import interviewRoutes from './routes/interview.routes.js'
import profileRoutes from "./routes/profile.routes.js";
import referralRoutes from "./routes/referral.routes.js";

import resumeRotes from "./routes/resume.routes.js"
import companyRoutes from "./routes/company.routes.js";

const app = express();
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5137"];

// cors configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

// basic configurations
app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb"}))
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/interview", interviewRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/referral",referralRoutes)
app.use("/api/v1/company", companyRoutes)
app.use("/api/v1/resume", resumeRotes)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

export default app;
