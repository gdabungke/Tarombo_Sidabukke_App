import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3),
  phone: z.string().min(9),
  email: z.string().email().optional().nullable().or(z.literal('')),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});