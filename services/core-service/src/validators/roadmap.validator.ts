import { z } from "zod";
import { objectIdSchema } from "./profile.validator.js";

const resourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  type: z.string().optional(),
});

const topicSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  resources: z.array(resourceSchema),
});

const stageSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0),
  topics: z.array(topicSchema),
});

export const createRoadmapSchema = z.object({
  body: z.object({
    companyId: objectIdSchema,
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    stages: z.array(stageSchema),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateRoadmapSchema = z.object({
  body: z.object({
    companyId: objectIdSchema.optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    stages: z.array(stageSchema).optional(),
    isPublished: z.boolean().optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const roadmapIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const getRoadmapsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    companyId: z.string().optional(), // Could be string to allow parse then match objectId, simplified for query
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
