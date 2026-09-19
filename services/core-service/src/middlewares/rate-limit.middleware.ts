import rateLimit from "express-rate-limit";

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP for most endpoints.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    code: "TOO_MANY_REQUESTS",
  },
});

/**
 * Stricter rate limiter for write operations (POST/PATCH/DELETE).
 * 30 requests per 15 minutes per IP.
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many write requests, please slow down.",
    code: "TOO_MANY_REQUESTS",
  },
});
