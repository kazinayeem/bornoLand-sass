import { z } from "zod";
import { COURIER_PROVIDER_SLUGS, TRACKING_REFRESH_INTERVALS } from "./courier.constants.js";

export const courierProviderParamSchema = z.object({
  provider: z.enum(COURIER_PROVIDER_SLUGS),
});

export const updateStoreCourierSchema = z.object({
  enabled: z.boolean().optional(),
  sandbox: z.boolean().optional(),
  credentials: z.record(z.string(), z.string()).optional(),
  shipmentSettings: z
    .object({
      autoCreateShipment: z.boolean().optional(),
      autoSyncTracking: z.boolean().optional(),
      autoRefreshTracking: z.enum(TRACKING_REFRESH_INTERVALS).optional(),
      codEnabled: z.boolean().optional(),
      defaultWeightKg: z.number().min(0).optional(),
      defaultDeliveryType: z.string().trim().max(64).optional(),
    })
    .optional(),
});

export const updateStoreCourierAccessSchema = z.object({
  providers: z.array(z.enum(COURIER_PROVIDER_SLUGS)),
});

export const updatePlanCourierAccessSchema = z.object({
  enabled: z.boolean(),
  allProviders: z.boolean().optional().default(false),
  providers: z.array(z.enum(COURIER_PROVIDER_SLUGS)).optional().default([]),
});
