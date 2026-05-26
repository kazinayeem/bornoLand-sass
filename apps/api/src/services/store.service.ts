import { randomBytes } from "crypto";
import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";

type ServiceResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

function buildPlaceholderImage(label: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-family="Arial, Helvetica, sans-serif" font-size="72">${label}</text></svg>`
  )}`;
}

function normalizeSubdomainInput(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : undefined;
}

function deriveStoreSubdomain(data: Record<string, unknown>): string {
  const candidates = [
    normalizeSubdomainInput(data.subdomain),
    normalizeSubdomainInput(data.slug),
    normalizeSubdomainInput(data.name),
  ].filter((value): value is string => Boolean(value));

  const base = (candidates[0] ?? "store")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "store";

  return base;
}

const DEFAULT_STORE_DATA = {
  hero: {
    imageUrl: buildPlaceholderImage("Store"),
  },
};

async function resolveTenantIdForStoreCreation(userId: string, tenantId?: string | null) {
  if (tenantId) {
    return tenantId;
  }

  await connectDatabase();

  const user = await UserModel.findById(userId).lean() as { tenantId?: unknown; name?: string; email?: string } | null;
  if (user?.tenantId) {
    return String(user.tenantId);
  }

  const tenantName = user?.name ? `${user.name}'s Workspace` : user?.email ? `${user.email.split("@")[0]}'s Workspace` : "My Workspace";
  const slugBase = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "workspace";
  const slug = `${slugBase}-${randomBytes(3).toString("hex")}`;

  const tenant = await TenantModel.create({
    name: tenantName,
    slug,
    subdomain: slug,
    plan: "free",
    status: "trialing",
  });

  await UserModel.updateOne({ _id: userId }, { $set: { tenantId: tenant._id } });

  return String(tenant._id);
}

export async function createStore(userId: string, data: Record<string, unknown>, tenantId?: string | null) {
  const resolvedTenantId = await resolveTenantIdForStoreCreation(userId, tenantId);
  const requestedSubdomain = normalizeSubdomainInput(data.subdomain);
  const storeBase = deriveStoreSubdomain(data);

  let subdomain = requestedSubdomain ?? storeBase;
  let suffix = 0;

  while (await StoreModel.exists({ subdomain })) {
    suffix += 1;
    subdomain = `${storeBase}-${suffix}`;
  }

  const sanitizedData = { ...data };
  delete sanitizedData.subdomain;

  const store = await StoreModel.create({
    tenantId: resolvedTenantId,
    userId,
    ...sanitizedData,
    subdomain,
    ...DEFAULT_STORE_DATA,
  });
  return { ok: true as const, data: { store: store.toObject() } };
}

export async function getUserStores(userId: string): Promise<ServiceResult<{ stores: unknown[] }>> {
  const stores = await StoreModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { stores } };
}

export async function getStoreById(id: string, userId: string): Promise<ServiceResult<{ store: unknown }>> {
  const store = await StoreModel.findOne({ _id: id, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { store } };
}

export async function updateStore(id: string, userId: string, payload: Record<string, unknown>): Promise<ServiceResult<{ store: unknown }>> {
  const updatePayload = { ...payload };
  if (Object.prototype.hasOwnProperty.call(updatePayload, "subdomain")) {
    const normalized = normalizeSubdomainInput(updatePayload.subdomain);
    if (!normalized) {
      delete updatePayload.subdomain;
    } else {
      const existing = await StoreModel.findOne({ subdomain: normalized, _id: { $ne: id } }).lean();
      if (existing) {
        return { ok: false as const, message: "Subdomain already in use" };
      }
      updatePayload.subdomain = normalized;
    }
  }

  const store = await StoreModel.findOneAndUpdate({ _id: id, userId }, { $set: updatePayload }, { new: true }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { store } };
}

export async function deleteStore(id: string, userId: string): Promise<ServiceResult<undefined>> {
  const result = await StoreModel.deleteOne({ _id: id, userId });
  if (!result.deletedCount) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: undefined, message: "Store deleted" };
}

export async function changeStoreTheme(id: string, userId: string, payload: Record<string, unknown>): Promise<ServiceResult<{ store: unknown }>> {
  const store = await StoreModel.findOneAndUpdate({ _id: id, userId }, { $set: { theme: payload } }, { new: true }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { store } };
}
