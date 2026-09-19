 import { RequestHandler } from "express";
import { ApiError } from "../utils/api-error.js";

export const notFoundMiddleware: RequestHandler = (
  req,
  _res,
  next,
) => {
  next(
    new ApiError(
      404,
      `Route ${req.method} ${req.originalUrl} not found`,
    ),
  );
};