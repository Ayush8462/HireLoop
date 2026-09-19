import { z } from 'zod';
import { objectIdSchema } from './profile.validator.js';

export const createSlotSchema = z.object({
  body: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    meetingUrl: z.string().url().optional()
  }).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateSlotSchema = z.object({
  body: z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    meetingUrl: z.string().url().optional()
  }).refine((data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
  }, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  }),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({})
});

export const slotIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({})
});

export const bookSlotSchema = z.object({
  body: z.object({
    slotId: objectIdSchema,
    notes: z.string().max(2000).optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const bookingIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({})
});

export const getSlotsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    seniorId: objectIdSchema.optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
  })
});

export const getBookingsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
  })
});
