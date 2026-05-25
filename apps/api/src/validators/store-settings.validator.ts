import { z } from "zod";

export const updateStoreSettingsSchema = z.object({
  currencyCode: z.enum(["USD", "BDT", "EUR", "INR"]).optional(),
  currencySymbol: z.string().min(1).max(8).optional(),
  currencyPosition: z.enum(["before", "after"]).optional(),
  locale: z.string().min(2).max(32).optional(),
  decimalPlaces: z.number().int().min(0).max(4).optional(),
  taxRate: z.number().min(0).max(100).optional()
});

export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;