import { RequestHandler } from "express";
import { env } from "../config/env.js";

/**
 * Middleware: validates internal service-to-service calls.
 * Requires the `x-internal-secret` header to match the configured secret.
 */
export const internalAuth: RequestHandler = (req, res, next) => {
  const secret = req.headers["x-internal-secret"];

  if (!secret || secret !== env.NOTIFICATION_INTERNAL_SECRET) {
    res.status(403).json({
      success: false,
      error: { message: "Forbidden: invalid internal secret" },
    });
    return;
  }

  next();
};
