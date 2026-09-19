import { z } from "zod";
export declare const requestReferralSchema: z.ZodObject<{
    body: z.ZodObject<{
        seniorId: z.ZodString;
        companyId: z.ZodString;
        jobTitle: z.ZodString;
        jobUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        message: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    params: z.ZodObject<{}, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
export declare const updateReferralStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            ACCEPTED: "ACCEPTED";
            CANCELLED: "CANCELLED";
            COMPLETED: "COMPLETED";
            PENDING: "PENDING";
            REJECTED: "REJECTED";
            SUBMITTED: "SUBMITTED";
        }>;
        responseMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
