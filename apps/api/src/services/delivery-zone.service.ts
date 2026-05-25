import { connectDatabase } from "../config/database.js";
import { DeliveryZoneModel } from "../models/delivery-zone.model.js";

export async function createDeliveryZone(
  storeId: string,
  payload: {
    name: string;
    charge: number;
    estimatedDays?: string;
    enabled?: boolean;
    sortOrder?: number;
  }
) {
  await connectDatabase();

  const existing = await DeliveryZoneModel.findOne({
    storeId,
    name: payload.name,
  }).lean();
  if (existing) {
    return { ok: false as const, message: "A delivery zone with this name already exists" };
  }

  const zone = await DeliveryZoneModel.create({
    storeId,
    name: payload.name,
    charge: payload.charge,
    estimatedDays: payload.estimatedDays ?? "3-5 days",
    enabled: payload.enabled ?? true,
    sortOrder: payload.sortOrder ?? 0,
  });

  return { ok: true as const, data: { deliveryZone: zone.toObject() } };
}

export async function listDeliveryZones(storeId: string) {
  await connectDatabase();
  const zones = await DeliveryZoneModel.find({ storeId })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return { ok: true as const, data: { deliveryZones: zones } };
}

export async function updateDeliveryZone(
  id: string,
  storeId: string,
  payload: Partial<{
    name: string;
    charge: number;
    estimatedDays: string;
    enabled: boolean;
    sortOrder: number;
  }>
) {
  await connectDatabase();
  const zone = await DeliveryZoneModel.findOneAndUpdate(
    { _id: id, storeId },
    { $set: payload },
    { new: true }
  ).lean();
  if (!zone) return { ok: false as const, message: "Delivery zone not found" };
  return { ok: true as const, data: { deliveryZone: zone } };
}

export async function deleteDeliveryZone(id: string, storeId: string) {
  await connectDatabase();
  const zone = await DeliveryZoneModel.findOneAndDelete({ _id: id, storeId }).lean();
  if (!zone) return { ok: false as const, message: "Delivery zone not found" };
  return { ok: true as const, message: "Delivery zone deleted" };
}

export async function getEnabledDeliveryZones(storeId: string) {
  await connectDatabase();
  const zones = await DeliveryZoneModel.find({ storeId, enabled: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return { ok: true as const, data: { deliveryZones: zones } };
}
