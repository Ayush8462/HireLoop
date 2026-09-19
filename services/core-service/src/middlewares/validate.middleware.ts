import { RequestHandler } from "express";
import { z } from "zod";

interface ValidationData {
  body: unknown;
  params: unknown;
  query: unknown;
}

export const validate = (
  schema: z.ZodType<ValidationData>,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data.body;

    next();
  };
};