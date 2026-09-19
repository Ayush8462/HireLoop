import { RequestHandler } from "express";
import { z } from "zod";
interface ValidationData {
    body: unknown;
    params: unknown;
    query: unknown;
}
export declare const validate: (schema: z.ZodType<ValidationData>) => RequestHandler;
export {};
