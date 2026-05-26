import { StoreModel } from "../models/store.model.js";

type ServiceResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

function buildPlaceholderImage(label: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-family="Arial, Helvetica, sans-serif" font-size="72">${label}</text></svg>`
  )}`;
}

const DEFAULT_STORE_DATA = {
  hero: {
    imageUrl: buildPlaceholderImage("Store"),
  },
};

export async function createStore(userId: string, data: Record<string, unknown>) {
  const store = await StoreModel.create({
    userId,
    ...data,
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
  const store = await StoreModel.findOneAndUpdate({ _id: id, userId }, { $set: payload }, { new: true }).lean();
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
