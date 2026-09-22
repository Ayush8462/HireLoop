import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import healthRoutes from "./routes/health.routes.js";
import testRoutes from "./routes/test.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import companyRoutes from "./routes/company.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "HireLoop Core Service",
  });
});

app.use("/health", healthRoutes);
app.use("/test", testRoutes);
app.use(["/profiles", "/api/profiles"], profileRoutes);
app.use(
  [
    "/companies",
    "/api/companies",
    "/company",
    "/api/company",
    "/roadmaps",
    "/api/roadmaps",
    "/roadmap",
    "/api/roadmap",
  ],
  companyRoutes
);
app.use(["/referrals", "/api/referrals"], referralRoutes);
app.use(["/interviews", "/api/interviews"], interviewRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);