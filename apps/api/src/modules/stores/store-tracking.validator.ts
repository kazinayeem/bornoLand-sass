import { z } from "zod";

export const updateMetaPixelSchema = z.object({
  enabled: z.boolean(),
  pixelId: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^\d{8,25}$/.test(val),
      {
        message: "Meta Pixel ID must contain only digits (8 to 25 numbers)",
      }
    ),
  advancedMatching: z.boolean().optional().default(false),
  automaticEvents: z.boolean().optional().default(true),
  testEventCode: z.string().trim().max(50).optional().default(""),
});

export const updateTikTokPixelSchema = z.object({
  enabled: z.boolean(),
  pixelId: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^[a-zA-Z0-9_-]{8,35}$/.test(val),
      {
        message: "TikTok Pixel ID must be a valid alphanumeric ID (8 to 35 characters)",
      }
    ),
  automaticEvents: z.boolean().optional().default(true),
  testEventCode: z.string().trim().max(50).optional().default(""),
});

export const testPixelSchema = z.object({
  platform: z.enum(["meta", "tiktok"]),
});

export const logTrackingEventSchema = z.object({
  eventName: z.string().min(1).max(100),
  platform: z.enum(["meta", "tiktok", "all"]).default("all"),
  status: z.enum(["sent", "skipped", "error"]).default("sent"),
  payloadSummary: z.record(z.string(), z.unknown()).optional().default({}),
});

export type UpdateMetaPixelInput = z.infer<typeof updateMetaPixelSchema>;
export type UpdateTikTokPixelInput = z.infer<typeof updateTikTokPixelSchema>;
export type TestPixelInput = z.infer<typeof testPixelSchema>;
export type LogTrackingEventInput = z.infer<typeof logTrackingEventSchema>;
