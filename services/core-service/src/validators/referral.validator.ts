import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const requestReferralSchema = z.object({
  body: z.object({
    seniorId: objectIdSchema,
    companyId: objectIdSchema,
    jobTitle: z.string().trim().min(2).max(200),
    jobUrl: z.string().trim().url().optional().or(z.literal("")),
    message: z.string().trim().max(2000).optional(),
    resumeUrl: z.string().trim().optional(),
    resumeFileName: z.string().trim().max(255).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateReferralStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "SUBMITTED",
      "COMPLETED",
      "CANCELLED",
    ]),
    responseMessage: z.string().trim().max(2000).optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});
