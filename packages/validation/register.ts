import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  export type RegisterInput = z.infer<typeof registerSchema>;