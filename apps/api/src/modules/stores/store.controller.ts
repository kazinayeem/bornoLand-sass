import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { createStore, deleteStore, getStoreById, getStoreBySlug, getUserStores, updateStore, changeStoreTheme, getStoreBranding, updateStoreBranding, clearStoreBrandAsset } from "./store.service.js";
import { StoreModel } from "./store.model.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";
import { computeChanges } from "../audit/audit.utils.js";

export async function createStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await createStore(userId, request.body);
  if (result.ok) {
    const store = result.data.store as { id?: string; _id?: string; name?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_CREATED,
      module: AUDIT_MODULES.STORES,
      entityType: "Store",
      entityId: store.id ?? String(store._id),
      entityName: store.name,
      storeId: store.id ?? String(store._id),
      newValue: request.body,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Store created", 201) : sendFailure(response, result.message);
}

export async function getUserStoresController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await getUserStores(userId);
  return sendSuccess(response, result.data);
}

export async function getStoreBySlugController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const slug = request.params.slug as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await getStoreBySlug(slug, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function getStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await getStoreById(id, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const before = await StoreModel.findOne({ _id: id, userId }).lean() as { name?: string; status?: string } | null;
  const result = await updateStore(id, userId, request.body);
  if (result.ok && before) {
    const store = result.data.store as { name?: string };
    const changes = computeChanges(before as Record<string, unknown>, request.body as Record<string, unknown>);
    const action = request.body?.status === "archived"
      ? AUDIT_ACTIONS.STORE_ARCHIVED
      : request.body?.status === "active" && before.status === "archived"
        ? AUDIT_ACTIONS.STORE_RESTORED
        : AUDIT_ACTIONS.STORE_SETTINGS_UPDATED;
    await recordAuditFromRequest(request, {
      action,
      module: AUDIT_MODULES.STORES,
      entityType: "Store",
      entityId: id,
      entityName: store.name ?? before.name,
      storeId: id,
      oldValue: before,
      newValue: result.data.store,
      changes,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Store updated") : sendFailure(response, result.message, 404);
}

export async function deleteStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await deleteStore(id, userId);
  if (result.ok) {
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_DELETED,
      module: AUDIT_MODULES.STORES,
      entityType: "Store",
      entityId: id,
      entityName: result.data.storeName,
      storeId: id,
      oldValue: { name: result.data.storeName, slug: result.data.storeSlug },
    });
    return sendSuccess(response, { storeName: result.data.storeName, storeSlug: result.data.storeSlug, tenantId: result.data.tenantId }, "Store deleted permanently");
  }
  return sendFailure(response, result.message, 404);
}

export async function changeStoreThemeController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await changeStoreTheme(id, userId, request.body);
  if (result.ok) {
    const store = result.data.store as { name?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_THEME_CHANGED,
      module: AUDIT_MODULES.STORES,
      entityType: "Store",
      entityId: id,
      entityName: store.name,
      storeId: id,
      newValue: request.body,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Theme updated") : sendFailure(response, result.message);
}

export async function getStoreBrandingController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await getStoreBranding(id, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateStoreBrandingController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await updateStoreBranding(id, userId, request.body);
  if (result.ok) {
    const store = result.data.store as { name?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_BRANDING_UPDATED,
      module: AUDIT_MODULES.STORES,
      entityType: "Store",
      entityId: id,
      entityName: store.name,
      storeId: id,
      newValue: request.body,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Branding updated") : sendFailure(response, result.message, 404);
}

export async function deleteStoreLogoController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await clearStoreBrandAsset(id, userId, "logo");
  return result.ok ? sendSuccess(response, result.data, "Logo removed") : sendFailure(response, result.message, 404);
}

export async function deleteStoreFaviconController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await clearStoreBrandAsset(id, userId, "favicon");
  return result.ok ? sendSuccess(response, result.data, "Favicon removed") : sendFailure(response, result.message, 404);
}
