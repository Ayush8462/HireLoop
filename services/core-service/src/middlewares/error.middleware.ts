import { ErrorRequestHandler } from "express";
import { MongoServerError } from "mongodb";
import { ZodError } from "zod";

import { ApiError } from "../utils/api-error.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
  } else if (
    error instanceof MongoServerError &&
    error.code === 11000
  ) {
    statusCode = 409;
    message = "Resource already exists";
  }

  logger.error(
    {
      error,
      method: req.method,
      url: req.originalUrl,
      statusCode,
    },
    "Request failed",
  );

  res.status(statusCode).json({
    success: false,
    message,

    ...(error instanceof ZodError && {
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    }),

    ...(env.NODE_ENV !== "production" && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};