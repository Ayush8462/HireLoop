import { z } from "zod";
export const registerSchema = z
    .object({
    email: z
        .string()
        .trim()
        .email()
        .max(254)
        .transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
    name: z.string().trim().min(1).max(100).optional(),
    firstName: z.string().trim().min(1).max(50).optional(),
    lastName: z.string().trim().min(1).max(50).optional(),
    role: z
        .string()
        .optional()
        .default("user")
        .transform((val) => {
        const lower = val.toLowerCase();
        if (lower === "student" || lower === "user")
            return "user";
        if (lower === "alumni" || lower === "senior")
            return "senior";
        if (lower === "admin")
            return "admin";
        return "user";
    }),
})
    .transform((data) => {
    let fName = data.firstName;
    let lName = data.lastName;
    if (!fName && data.name) {
        const parts = data.name.trim().split(/\s+/);
        fName = parts[0] || "User";
        lName = parts.slice(1).join(" ") || parts[0] || "User";
    }
    return {
        email: data.email,
        password: data.password,
        firstName: fName || "User",
        lastName: lName || "User",
        role: data.role,
    };
});
export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email()
        .max(254)
        .transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128),
});
//# sourceMappingURL=auth.validator.js.map