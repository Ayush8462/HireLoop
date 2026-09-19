import { z } from "zod";
import { objectIdSchema } from "./profile.validator.js";

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
    description: z.string().max(2000).optional(),
    industry: z.string().max(100).optional(),
    headquarters: z.string().max(200).optional(),
    size: z.string().max(50).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
    description: z.string().max(2000).optional(),
    industry: z.string().max(100).optional(),
    headquarters: z.string().max(200).optional(),
    size: z.string().max(50).optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const companyIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const companySlugSchema = z.object({
  body: z.object({}),
  params: z.object({
    slug: z.string().min(1).max(150),
  }),
  query: z.object({}),
});

export const getCompaniesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    search: z.string().optional(),
    industry: z.string().optional(),
    isVerified: z.preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : undefined),
      z.boolean().optional()
    ),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
