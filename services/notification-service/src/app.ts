import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import notificationRoutes from "./routes/notification.routes.js";
import internalRoutes from "./routes/internal.routes.js";

const app = express();

app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);

app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "hireloop-notification-service",
    status: "healthy",
  });
});

// Frontend-facing routes (JWT protected)
app.use("/notifications", notificationRoutes);

// Internal routes (service-to-service, x-internal-secret protected)
app.use("/internal", internalRoutes);

// Global error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[notification-service] Error:", message);
    res.status(500).json({ success: false, error: { message } });
  },
);

export default app;
