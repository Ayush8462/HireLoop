import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import {
  errorHandler,
} from "./middlewares/error.middleware.js";


const app = express()
app.disable("x-powered-by");

app.use(helmet());

app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
    })
)


app.use(express.json())

app.use(cookieParser())

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "hireloop-auth-service working fine",
    })
})

app.use("/",authRoutes)
app.use(errorHandler);

export default app;