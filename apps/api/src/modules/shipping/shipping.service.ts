import { connectDatabase } from "../../common/database/connection.js";
import { ShippingZoneModel } from "./shipping-zone.model.js";
import { z } from "zod";

const methodSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["flat_rate", "free", "weight_based", "price_based", "local_pickup"]).default("flat_rate"),
  rate: z.number().min(0).optional().default(0),
  minOrderAmount: z.number().min(0).optional().default(0),
  maxWeight: z.number().min(0).optional().default(0),
  enabled: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

const zoneSchema = z.object({
  name: z.string().min(1).max(200),
  countries: z.array(z.string()).optional().default([]),
  regions: z.array(z.string()).optional().default([]),
  zipCodes: z.array(z.string()).optional().default([]),
  methods: z.array(methodSchema).optional().default([]),
  enabled: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

export async function listShippingZones(storeId: string) {
  await connectDatabase();
  const zones = await ShippingZoneModel.find({ storeId }).sort({ sortOrder: 1 }).lean();
  return { ok: true as const, data: { zones } };
}

export async function createShippingZone(storeId: string, payload: unknown) {
  const parsed = zoneSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid shipping zone data" };
  await connectDatabase();
  const zone = await ShippingZoneModel.create({ storeId, ...parsed.data });
  return { ok: true as const, data: { zone: zone.toObject() } };
}

export async function updateShippingZone(storeId: string, id: string, payload: unknown) {
  const parsed = zoneSchema.partial().safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid shipping zone data" };
  await connectDatabase();
  const zone = await ShippingZoneModel.findOneAndUpdate({ _id: id, storeId }, { $set: parsed.data }, { new: true }).lean();
  if (!zone) return { ok: false as const, message: "Shipping zone not found" };
  return { ok: true as const, data: { zone } };
}

export async function deleteShippingZone(storeId: string, id: string) {
  await connectDatabase();
  const zone = await ShippingZoneModel.findOneAndDelete({ _id: id, storeId }).lean();
  if (!zone) return { ok: false as const, message: "Shipping zone not found" };
  return { ok: true as const, message: "Shipping zone deleted" };
}
