import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { createStoreSchema, updateStoreSchema, type CreateStoreInput, type UpdateStoreInput } from "../validators/store.validator.js";

export async function createStore(userId: string, payload: unknown) {
  const parsed = createStoreSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid store data" };

  await connectDatabase();

  const existingSlug = await StoreModel.findOne({ slug: parsed.data.slug });
  if (existingSlug) return { ok: false as const, message: "Store slug already taken" };

  const userTenants = await TeamMemberModel.find({ userId }).distinct("tenantId");
  let tenantId = userTenants[0];

  if (!tenantId) {
    const slug = `store-${Date.now()}`;
    const tenant = await TenantModel.create({
      name: parsed.data.name,
      slug,
      subdomain: slug,
      plan: parsed.data.plan ?? "free",
      status: "active"
    });
    tenantId = tenant._id;
    await TeamMemberModel.create({ tenantId, userId, role: "owner", status: "active", invitedAt: new Date(), acceptedAt: new Date() });
  }

  const store = await StoreModel.create({
    tenantId,
    userId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    subdomain: `${parsed.data.slug}.bornoland.com`,
    description: parsed.data.description ?? "",
    category: parsed.data.category ?? "general",
    plan: parsed.data.plan ?? "free",
    status: "active"
  });

  return { ok: true as const, data: { store: store.toObject() } };
}

export async function getUserStores(userId: string) {
  await connectDatabase();
  const stores = await StoreModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { stores } };
}

export async function getStoreById(storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { store } };
}

export async function updateStore(storeId: string, userId: string, payload: unknown) {
  const parsed = updateStoreSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid update data" };

  await connectDatabase();
  const store = await StoreModel.findOneAndUpdate(
    { _id: storeId, userId },
    { $set: parsed.data },
    { new: true }
  ).lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { store } };
}

export async function deleteStore(storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOneAndDelete({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, message: "Store deleted" };
}
