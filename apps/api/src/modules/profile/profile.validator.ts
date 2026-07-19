import { z } from "zod";

const passwordRule = z.string().min(8).max(128)
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/, "Use letters, numbers, dots, hyphens, or underscores"),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().max(25).refine((value) => !value || /^\+?[0-9][0-9\s()-]{6,20}$/.test(value), "Enter a valid phone number"),
  company: z.string().trim().max(100),
  storeName: z.string().trim().max(100),
  country: z.string().trim().max(80),
  timezone: z.string().trim().min(1).max(80).refine((value) => {
    try { Intl.DateTimeFormat(undefined, { timeZone: value }); return true; } catch { return false; }
  }, "Enter a valid timezone"),
  language: z.string().trim().min(2).max(10).regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
  bio: z.string().trim().max(500),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]),
    dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
    emailNotifications: z.boolean(),
    browserNotifications: z.boolean(),
    marketingEmails: z.boolean(),
  }),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordRule,
  confirmPassword: z.string().min(1).max(128),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from the current password",
  path: ["newPassword"],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
