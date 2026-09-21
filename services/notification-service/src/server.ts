import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { initSocket } from "./config/socket.js";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  // Create HTTP server so Socket.io can share it with Express
  const httpServer = http.createServer(app);

  // Attach Socket.io to the HTTP server
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.info(`[notification-service] Running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string): void => {
    console.info(`[notification-service] ${signal} received — shutting down`);
    httpServer.close(() => {
      console.info("[notification-service] HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  console.error("[notification-service] Failed to start:", error);
  process.exit(1);
});
