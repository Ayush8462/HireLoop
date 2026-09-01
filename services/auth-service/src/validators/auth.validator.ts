import {z} from "zod";

export const registerSchema = z.object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) =>
        value.toLowerCase()
      ),

    password: z
      .string()
      .min(8)
      .max(128),

    firstName: z
      .string()
      .trim()
      .min(1)
      .max(50),

    lastName: z
      .string()
      .trim()
      .min(1)
      .max(50),
})


export const loginSchema = z.object({
  email:z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value)=>
        value.toLowerCase()
      ),
    password: z
      .string()
      .min(1)
      .max(128),
      
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type LonginInput = z.infer<typeof loginSchema>;