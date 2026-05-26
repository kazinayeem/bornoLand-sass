import { z } from "zod";

export const updateStoreSettingsSchema = z.object({
  currencyCode: z.enum(["USD", "BDT", "EUR", "INR"]).optional(),
  currencySymbol: z.string().min(1).max(8).optional(),
  currencyPosition: z.enum(["before", "after"]).optional(),
  locale: z.string().min(2).max(32).optional(),
  decimalPlaces: z.number().int().min(0).max(4).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).optional(),
  timezone: z.string().min(1).max(64).optional(),
  language: z.enum(["en", "bn", "es", "fr", "de", "ar", "hi", "zh", "ja", "ko"]).optional(),
});

export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
