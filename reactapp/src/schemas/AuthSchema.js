
import { z } from "zod";
// registeration validation
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(40, "First name must be 40 characters or fewer"),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(40, "Last name must be 40 characters or fewer"),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),

    bio: z
      .string()
      .max(280, "Bio must not exceed 280 characters")
      .optional()
      .default(""),
    avatar: z
      .custom(
        (file) => typeof File !== "undefined" && file instanceof File,
        "A profile image is required",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});