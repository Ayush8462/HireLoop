import { z } from "zod";
<<<<<<< HEAD
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
=======

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const companyFields = {
  name: z.string().trim().min(2).max(150),
  logo: z.string().trim().url().optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().max(3000).optional(),
  industry: z.string().trim().max(150).optional(),
  headquarters: z.string().trim().max(200).optional(),
};

export const createCompanySchema = z.object({
  body: z.object(companyFields),
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  params: z.object({}),
  query: z.object({}),
});

<<<<<<< HEAD
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
=======
export const roadmapResourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().trim().url().max(2048),
  type: z.string().trim().max(50).optional(),
});

export const roadmapTopicSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  resources: z.array(roadmapResourceSchema).default([]),
});

export const roadmapStageSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  order: z.number().int().min(1),
  topics: z.array(roadmapTopicSchema).default([]),
});

export const createRoadmapFields = {
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(3000).optional(),
  stages: z.array(roadmapStageSchema).default([]),
  isPublished: z.boolean().default(true),
};

export const createRoadmapSchema = z.object({
  body: z.object(createRoadmapFields),
  params: z.object({
    companyId: objectIdSchema,
  }),
  query: z.object({}),
});

export const updateRoadmapSchema = z.object({
  body: z.object(createRoadmapFields).partial(),
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});
<<<<<<< HEAD

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
=======
>>>>>>> 55f20c7ca04c3b0ac5e7d8c00ec73b2c22d8f990
