import express from "express";
import cors from "cors";
import helmet from "helmet";
import {pinoHttp} from "pino-http";
import testRoutes from "./routes/test.routes.js";

import { logger } from "./config/logger.js";
import healthRoutes from "./routes/health.routes.js";
import profileRoutes from "./routes/profile.routes.js"
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "HireLoop Core Service",
  });
});

app.use("/health", healthRoutes);
app.use("/test", testRoutes);
app.use("/profiles", profileRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);