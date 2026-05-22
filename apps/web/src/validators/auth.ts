import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  tenantName: z.string().min(2).max(80).optional(),
  rememberMe: z.boolean().optional().default(false)
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional().default(false),
  loginType: z.enum(["user", "admin"]).optional().default("user")
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128)
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
