import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import proxyRoutes from "./routes/proxy.routes.js";

const app = express();

app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  env.clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(proxyRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "hireloop-gateway",
    status: "healthy",
  });
});

export default app;