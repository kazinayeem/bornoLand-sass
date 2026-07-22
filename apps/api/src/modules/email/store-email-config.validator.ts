import { z } from "zod";

export const encryptionEnum = z.enum(["tls", "ssl", "starttls", "none"]);

export const updateEmailConfigSchema = z.object({
  senderName: z.string().max(200).optional(),
  senderEmail: z.union([z.literal(""), z.string().email().max(320)]).optional(),
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpUser: z.string().max(255).optional(),
  smtpPass: z.string().max(512).optional(),
  encryption: encryptionEnum.optional(),
  replyToEmail: z.union([z.literal(""), z.string().email().max(320)]).optional(),
  bccEmail: z.union([z.literal(""), z.string().email().max(320)]).optional(),
  enabled: z.boolean().optional(),
  defaultLanguage: z.string().max(10).optional(),
  timezone: z.string().max(64).optional(),
});

export type UpdateEmailConfigInput = z.infer<typeof updateEmailConfigSchema>;
