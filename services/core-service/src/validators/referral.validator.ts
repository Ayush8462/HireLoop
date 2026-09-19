import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

export const requestReferralSchema = z.object({
  body: z.object({
    seniorId: objectIdSchema,
    companyId: objectIdSchema,
    jobTitle: z.string().max(200),
    jobUrl: z.string().url().optional(),
    message: z.string().max(2000).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const acceptRejectReferralSchema = z.object({
  body: z.object({
    responseMessage: z.string().max(2000).optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const referralIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const paginationQuerySchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
