import { z } from "zod";
import { connectDatabase } from "../../common/database/connection.js";
import { AddressModel } from "./address.model.js";

const addressPayloadSchema = z.object({
  label: z.enum(["Home", "Office", "Other"]).default("Home"),
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  phone: z.string().trim().min(1, "Phone is required").max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  country: z.string().trim().min(1).max(80).default("Bangladesh"),
  state: z.string().trim().min(1, "Division/State is required").max(120),
  city: z.string().trim().min(1, "District/City is required").max(120),
  area: z.string().trim().max(120).optional().default(""),
  street: z.string().trim().min(1, "Street address is required").max(200),
  apartment: z.string().trim().max(120).optional().default(""),
  zip: z.string().trim().max(30).optional().default(""),
  landmark: z.string().trim().max(120).optional().default(""),
  orderNotes: z.string().trim().max(500).optional().default(""),
  isDefault: z.boolean().optional().default(false),
});

export type CustomerAddressPayload = z.infer<typeof addressPayloadSchema>;

function normalizeAddress(payload: CustomerAddressPayload) {
  return {
    label: payload.label,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email ?? "",
    country: payload.country || "Bangladesh",
    state: payload.state,
    city: payload.city,
    area: payload.area ?? "",
    street: payload.street,
    apartment: payload.apartment ?? "",
    zip: payload.zip ?? "",
    landmark: payload.landmark ?? "",
    orderNotes: payload.orderNotes ?? "",
    isDefault: Boolean(payload.isDefault),
  };
}

async function ensureSingleDefault(customerId: string, keepId?: string) {
  const filter: Record<string, unknown> = { customerId, isDefault: true };
  if (keepId) filter._id = { $ne: keepId };
  await AddressModel.updateMany(filter, { $set: { isDefault: false } });
}

async function ensureFallbackDefault(customerId: string) {
  const existingDefault = await AddressModel.findOne({ customerId, isDefault: true }).lean();
  if (existingDefault) return;
  const first = await AddressModel.findOne({ customerId }).sort({ createdAt: 1 });
  if (first) {
    first.isDefault = true;
    await first.save();
  }
}

export async function listCustomerAddresses(storeId: string, customerId: string) {
  await connectDatabase();
  const addresses = await AddressModel.find({ storeId, customerId }).sort({ isDefault: -1, createdAt: 1 }).lean();
  return { ok: true as const, data: { addresses, maxAddresses: 2 } };
}

export async function createCustomerAddress(storeId: string, customerId: string, payload: unknown) {
  const parsed = addressPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Invalid address" };

  await connectDatabase();
  const count = await AddressModel.countDocuments({ storeId, customerId });
  if (count >= 2) {
    return { ok: false as const, message: "You can save up to 2 addresses." };
  }

  const normalized = normalizeAddress(parsed.data);
  const shouldDefault = normalized.isDefault || count === 0;
  if (shouldDefault) {
    await ensureSingleDefault(customerId);
  }

  const address = await AddressModel.create({
    storeId,
    customerId,
    ...normalized,
    isDefault: shouldDefault,
  });

  return { ok: true as const, data: { address: address.toObject() } };
}

export async function updateCustomerAddress(storeId: string, customerId: string, addressId: string, payload: unknown) {
  const parsed = addressPayloadSchema.partial().safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Invalid address" };

  await connectDatabase();
  const existing = await AddressModel.findOne({ _id: addressId, storeId, customerId });
  if (!existing) return { ok: false as const, message: "Address not found" };

  const update = parsed.data;
  if (update.isDefault) {
    await ensureSingleDefault(customerId, addressId);
  }

  Object.assign(existing, {
    ...(update.label !== undefined ? { label: update.label } : {}),
    ...(update.fullName !== undefined ? { fullName: update.fullName } : {}),
    ...(update.phone !== undefined ? { phone: update.phone } : {}),
    ...(update.email !== undefined ? { email: update.email ?? "" } : {}),
    ...(update.country !== undefined ? { country: update.country } : {}),
    ...(update.state !== undefined ? { state: update.state } : {}),
    ...(update.city !== undefined ? { city: update.city } : {}),
    ...(update.area !== undefined ? { area: update.area } : {}),
    ...(update.street !== undefined ? { street: update.street } : {}),
    ...(update.apartment !== undefined ? { apartment: update.apartment } : {}),
    ...(update.zip !== undefined ? { zip: update.zip } : {}),
    ...(update.landmark !== undefined ? { landmark: update.landmark } : {}),
    ...(update.orderNotes !== undefined ? { orderNotes: update.orderNotes } : {}),
    ...(update.isDefault !== undefined ? { isDefault: update.isDefault } : {}),
  });

  await existing.save();
  if (!existing.isDefault) {
    await ensureFallbackDefault(customerId);
  }

  return { ok: true as const, data: { address: existing.toObject() } };
}

export async function deleteCustomerAddress(storeId: string, customerId: string, addressId: string) {
  await connectDatabase();
  const existing = await AddressModel.findOneAndDelete({ _id: addressId, storeId, customerId }).lean();
  if (!existing) return { ok: false as const, message: "Address not found" };
  await ensureFallbackDefault(customerId);
  return { ok: true as const, data: { deleted: true } };
}

export async function setDefaultCustomerAddress(storeId: string, customerId: string, addressId: string) {
  await connectDatabase();
  const existing = await AddressModel.findOne({ _id: addressId, storeId, customerId });
  if (!existing) return { ok: false as const, message: "Address not found" };
  await ensureSingleDefault(customerId, addressId);
  existing.isDefault = true;
  await existing.save();
  return { ok: true as const, data: { address: existing.toObject() } };
}

export async function autoSaveCustomerAddressFromOrder(
  storeId: string,
  customerId: string,
  shippingAddress: {
    fullName: string;
    phone: string;
    email?: string;
    country?: string;
    state?: string;
    city?: string;
    area?: string;
    street: string;
    apartment?: string;
    zip?: string;
    landmark?: string;
    orderNotes?: string;
  },
) {
  await connectDatabase();
  const count = await AddressModel.countDocuments({ storeId, customerId });
  if (count > 0 || count >= 2) return;

  await AddressModel.create({
    storeId,
    customerId,
    label: "Home",
    fullName: shippingAddress.fullName,
    phone: shippingAddress.phone,
    email: shippingAddress.email ?? "",
    country: shippingAddress.country ?? "Bangladesh",
    state: shippingAddress.state ?? "",
    city: shippingAddress.city ?? "",
    area: shippingAddress.area ?? "",
    street: shippingAddress.street,
    apartment: shippingAddress.apartment ?? "",
    zip: shippingAddress.zip ?? "",
    landmark: shippingAddress.landmark ?? "",
    orderNotes: shippingAddress.orderNotes ?? "",
    isDefault: true,
  });
}
