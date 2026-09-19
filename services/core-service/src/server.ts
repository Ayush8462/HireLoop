import { app } from "./app.js";
import { env } from "./config/env.js";
import  {connectDatabase}  from "./config/database.js";
import { logger } from "./config/logger.js";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        environment: env.NODE_ENV,
      },
      "Core Service started successfully",
    );
  });

  const shutdown = (signal: string): void => {
    logger.info(
      {
        signal,
      },
      "Shutdown signal received",
    );

    server.close(() => {
      logger.info("HTTP server closed");

      process.exit(0);
    });

    setTimeout(() => {
      logger.error(
        "Forced shutdown because graceful shutdown timed out",
      );

      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  logger.fatal(
    {
      error,
    },
    "Failed to start Core Service",
  );

  process.exit(1);
});