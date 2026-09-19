import { z } from "zod";
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
    params: z.object({}),
    query: z.object({}),
});
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
    params: z.object({
        id: objectIdSchema,
    }),
    query: z.object({}),
});
//# sourceMappingURL=company.validator.js.map