import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === ""
    ? undefined
    : value;

const optionalString = (schema: z.ZodString) =>
  z.preprocess(emptyStringToUndefined, schema.optional());

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(emptyStringToUndefined, z.coerce.number().pipe(schema).optional());

/**
 * MongoDB ObjectId validation
 */
const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId",
  );

/**
 * Profile role
 *
 * This is a HireLoop business role.
 * It is different from the Auth Service role.
 */
const profileRoleSchema = z.preprocess((value) => {
  const normalizedValue = emptyStringToUndefined(value);

  if (typeof normalizedValue !== "string") {
    return normalizedValue;
  }

  const role = normalizedValue.trim().toUpperCase();

  if (role === "USER") {
    return "STUDENT";
  }

  if (role === "ALUMNI") {
    return "SENIOR";
  }

  return role;
}, z.enum([
  "STUDENT",
  "SENIOR",
]));

/**
 * Common fields used while creating a profile.
 */
const createProfileFields = {
  role: profileRoleSchema.optional(),

  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),

  username: optionalString(
    z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must contain at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can contain only lowercase letters, numbers and underscores",
      ),
  ),

  bio: optionalString(
    z
      .string()
      .trim()
      .max(1000, "Bio cannot exceed 1000 characters"),
  ),

  phone: optionalString(
    z
      .string()
      .trim()
      .max(30, "Phone number cannot exceed 30 characters"),
  ),

  avatar: optionalString(
    z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .max(2048, "Avatar URL is too long"),
  ),

  college: optionalString(
    z
      .string()
      .trim()
      .max(200, "College name cannot exceed 200 characters"),
  ),

  degree: optionalString(
    z
      .string()
      .trim()
      .max(150, "Degree cannot exceed 150 characters"),
  ),

  branch: optionalString(
    z
      .string()
      .trim()
      .max(150, "Branch cannot exceed 150 characters"),
  ),

  graduationYear: optionalNumber(
    z
      .number()
      .int("Graduation year must be an integer")
      .min(1950, "Invalid graduation year")
      .max(2100, "Invalid graduation year"),
  ),

  companyId: z.preprocess(emptyStringToUndefined, objectIdSchema.optional()),

  designation: optionalString(
    z
      .string()
      .trim()
      .max(150, "Designation cannot exceed 150 characters"),
  ),

  experienceYears: optionalNumber(
    z
      .number()
      .min(0, "Experience cannot be negative")
      .max(100, "Invalid experience"),
  ),

  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill cannot be empty")
        .max(100, "Skill cannot exceed 100 characters"),
    )
    .max(50, "You can have a maximum of 50 skills")
    .optional(),
};

/**
 * Fields allowed while updating a profile.
 *
 * Notice that `role` is intentionally NOT included.
 *
 * A user cannot change:
 *
 * STUDENT -> SENIOR
 * SENIOR  -> STUDENT
 *
 * through PATCH /profiles/me.
 */
const updateProfileFields = {
  firstName: z
    .string()
    .trim()
    .min(1, "First name cannot be empty")
    .max(100, "First name cannot exceed 100 characters")
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name cannot be empty")
    .max(100, "Last name cannot exceed 100 characters")
    .optional(),

  username: optionalString(
    z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must contain at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can contain only lowercase letters, numbers and underscores",
      ),
  ),

  bio: optionalString(
    z
      .string()
      .trim()
      .max(1000, "Bio cannot exceed 1000 characters"),
  ),

  phone: optionalString(
    z
      .string()
      .trim()
      .max(30, "Phone number cannot exceed 30 characters"),
  ),

  avatar: optionalString(
    z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .max(2048, "Avatar URL is too long"),
  ),

  college: optionalString(
    z
      .string()
      .trim()
      .max(200, "College name cannot exceed 200 characters"),
  ),

  degree: optionalString(
    z
      .string()
      .trim()
      .max(150, "Degree cannot exceed 150 characters"),
  ),

  branch: optionalString(
    z
      .string()
      .trim()
      .max(150, "Branch cannot exceed 150 characters"),
  ),

  graduationYear: optionalNumber(
    z
      .number()
      .int("Graduation year must be an integer")
      .min(1950, "Invalid graduation year")
      .max(2100, "Invalid graduation year"),
  ),

  companyId: z.preprocess(emptyStringToUndefined, objectIdSchema.optional()),

  designation: optionalString(
    z
      .string()
      .trim()
      .max(150, "Designation cannot exceed 150 characters"),
  ),

  experienceYears: optionalNumber(
    z
      .number()
      .min(0, "Experience cannot be negative")
      .max(100, "Invalid experience"),
  ),

  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill cannot be empty")
        .max(100, "Skill cannot exceed 100 characters"),
    )
    .max(50, "You can have a maximum of 50 skills")
    .optional(),
};

/**
 * POST /profiles
 *
 * Used to create a new profile.
 */
export const createProfileSchema = z.object({
  body: z.object(createProfileFields),

  params: z.object({}),

  query: z.object({}),
});

/**
 * PATCH /profiles/me
 *
 * Used to update the authenticated user's profile.
 */
export const updateProfileSchema = z.object({
  body: z.object(updateProfileFields),

  params: z.object({}),

  query: z.object({}),
});

/**
 * GET /profiles/:id
 *
 * Validates the profile ID from the URL.
 */
export const profileIdSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});
