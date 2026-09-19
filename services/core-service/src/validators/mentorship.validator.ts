import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

export const sendMentorshipRequestSchema = z.object({
  body: z.object({
    seniorId: objectIdSchema,
    message: z.string().max(2000).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const mentorshipIdSchema = z.object({
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
