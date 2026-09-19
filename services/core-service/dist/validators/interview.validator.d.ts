import { z } from "zod";
export declare const createSlotSchema: z.ZodObject<{
    body: z.ZodObject<{
        startTime: z.ZodString;
        endTime: z.ZodString;
    }, z.core.$strip>;
    params: z.ZodObject<{}, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
export declare const bookInterviewSchema: z.ZodObject<{
    body: z.ZodObject<{
        slotId: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    params: z.ZodObject<{}, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
