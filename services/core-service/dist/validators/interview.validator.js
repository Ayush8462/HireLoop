import { z } from "zod";
const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
export const createSlotSchema = z.object({
    body: z.object({
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
    }),
    params: z.object({}),
    query: z.object({}),
});
export const bookInterviewSchema = z.object({
    body: z.object({
        slotId: objectIdSchema,
        notes: z.string().trim().max(2000).optional(),
    }),
    params: z.object({}),
    query: z.object({}),
});
//# sourceMappingURL=interview.validator.js.map