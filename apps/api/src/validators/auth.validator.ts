import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  tenantName: z.string().min(2).max(80).optional(),
  rememberMe: z.boolean().optional().default(false)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional().default(false),
  loginType: z.enum(["user", "admin"]).optional().default("user")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128)
});

export const googleOAuthSchema = z.object({
  code: z.string().min(1),
  state: z.string().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;