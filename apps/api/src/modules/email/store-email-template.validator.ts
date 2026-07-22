import { z } from "zod";

export const updateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
