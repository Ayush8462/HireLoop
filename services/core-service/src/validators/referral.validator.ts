import { z } from "zod";
<<<<<<< HEAD
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});
=======

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990

export const requestReferralSchema = z.object({
  body: z.object({
    seniorId: objectIdSchema,
    companyId: objectIdSchema,
<<<<<<< HEAD
    jobTitle: z.string().max(200),
    jobUrl: z.string().url().optional(),
    message: z.string().max(2000).optional(),
=======
    jobTitle: z.string().trim().min(2).max(200),
    jobUrl: z.string().trim().url().optional().or(z.literal("")),
    message: z.string().trim().max(2000).optional(),
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }),
  params: z.object({}),
  query: z.object({}),
});

<<<<<<< HEAD
export const acceptRejectReferralSchema = z.object({
  body: z.object({
    responseMessage: z.string().max(2000).optional(),
=======
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
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});
<<<<<<< HEAD

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
=======
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
