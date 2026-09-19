import { z } from 'zod';
import { objectIdSchema } from './profile.validator.js';

export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    fileUrl: z.string().url().max(2048),
    fileName: z.string().max(255).optional(),
    storageKey: z.string().max(1024).optional(),
    mimeType: z.enum([
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]).optional(),
    size: z.number().min(0).max(10_485_760).optional(),
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateResumeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    fileUrl: z.string().url().max(2048).optional(),
    fileName: z.string().max(255).optional(),
    storageKey: z.string().max(1024).optional(),
    mimeType: z.enum([
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]).optional(),
    size: z.number().min(0).max(10_485_760).optional(),
  }),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({})
});

export const resumeIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({})
});

export const getResumesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
  })
});
