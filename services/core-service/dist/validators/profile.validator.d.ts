import { z } from "zod";
/**
 * POST /profiles
 *
 * Used to create a new profile.
 */
export declare const createProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        role: z.ZodOptional<z.ZodPreprocess<z.ZodEnum<{
            SENIOR: "SENIOR";
            STUDENT: "STUDENT";
        }>, unknown>>;
        firstName: z.ZodString;
        lastName: z.ZodString;
        username: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        bio: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        phone: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        avatar: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        college: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        degree: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        branch: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        graduationYear: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodNumber>>, unknown>;
        companyId: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        designation: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        experienceYears: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodNumber>>, unknown>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    params: z.ZodObject<{}, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
/**
 * PATCH /profiles/me
 *
 * Used to update the authenticated user's profile.
 */
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        username: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        bio: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        phone: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        avatar: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        college: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        degree: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        branch: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        graduationYear: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodNumber>>, unknown>;
        companyId: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        designation: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
        experienceYears: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodNumber>>, unknown>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    params: z.ZodObject<{}, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
/**
 * GET /profiles/:id
 *
 * Validates the profile ID from the URL.
 */
export declare const profileIdSchema: z.ZodObject<{
    body: z.ZodObject<{}, z.core.$strip>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
