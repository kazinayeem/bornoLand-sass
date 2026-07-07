import { z } from "zod";

export const trackPageViewSchema = z.object({
  pageType: z.enum(["homepage", "product", "category", "cms_page", "search", "cart", "checkout", "order_success", "not_found", "landing", "other"]).optional().default("other"),
  url: z.string().max(2000).optional().default(""),
  path: z.string().max(500).optional().default(""),
  title: z.string().max(500).optional().default(""),
  productId: z.string().max(100).optional(),
  categoryId: z.string().max(100).optional(),
  pageId: z.string().max(100).optional(),
  searchQuery: z.string().max(500).optional().default(""),
  referrer: z.string().max(2000).optional().default(""),
  utmSource: z.string().max(500).optional().default(""),
  utmMedium: z.string().max(500).optional().default(""),
  utmCampaign: z.string().max(500).optional().default(""),
  utmTerm: z.string().max(500).optional().default(""),
  utmContent: z.string().max(500).optional().default(""),
  ip: z.string().max(100).optional().default(""),
  userAgent: z.string().max(1000).optional().default(""),
  language: z.string().max(50).optional().default(""),
  visitorId: z.string().max(200).optional(),
  sessionId: z.string().max(200).optional(),
  tenantId: z.string().max(100).optional().default(""),
});

export const trackSessionEndSchema = z.object({
  sessionId: z.string().min(1).max(200),
  exitPage: z.string().max(2000).optional().default(""),
  duration: z.number().min(0).max(86400).optional().default(0),
});

export type TrackPageViewInput = z.infer<typeof trackPageViewSchema>;
export type TrackSessionEndInput = z.infer<typeof trackSessionEndSchema>;
