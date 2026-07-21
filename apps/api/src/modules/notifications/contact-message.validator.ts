import { z } from "zod";
import { CONTACT_STATUSES } from "./contact.model.js";

export const updateContactMessageSchema = z.object({
  status: z.enum(CONTACT_STATUSES).optional(),
  notes: z.string().max(5000).optional(),
  archived: z.boolean().optional(),
});

export const listContactMessagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  status: z.enum(CONTACT_STATUSES).optional(),
  archived: z.enum(["true", "false"]).optional(),
});
