import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { connectDatabase } from "../database/connection.js";
import { StoreModel } from "../../modules/stores/store.model.js";
import { StoreMemberModel } from "../../modules/team/store-member.model.js";
import { hasPermission, roleToPermissions } from "../types/permissions.js";

export type PermissionRequest = AuthRequest & {
  storeContext?: {
    storeId: string;
    tenantId: string;
    isOwner: boolean;
    memberRole: string;
    memberPermissions: string[];
  };
};

/**
 * Core store access + permission resolver.
 *
 * Resolves storeId from `req.params.storeId`, `req.params.id` (if it looks like
 * a slug, we look up by slug), `req.body.storeId`, or `req.query.storeId`.
 *
 * Authorization hierarchy:
 *  1. Super Admin → full access always.
 *  2. Store Owner (store.userId === userId) → full access always.
 *  3. Active StoreMember → checked against required permission.
 *  4. Otherwise → 403 PERMISSION_DENIED.
 */
async function resolveStoreAccess(
  req: PermissionRequest,
  res: Response,
  requiredPermission?: string,
): Promise<boolean> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" });
    return false;
  }

  // Super admin bypasses all store-level permission checks
  if (req.user?.role === "super_admin") {
    req.storeContext = {
      storeId: "super_admin",
      tenantId: "",
      isOwner: true,
      memberRole: "owner",
      memberPermissions: ["*"],
    };
    return true;
  }

  // Resolve storeId — might be an ObjectId or a slug
  const rawId = (req.params.storeId || req.params.id || req.body?.storeId || req.query?.storeId) as string | undefined;
  if (!rawId) {
    res.status(400).json({ success: false, message: "Store ID or slug is required", code: "MISSING_STORE_ID" });
    return false;
  }

  await connectDatabase();

  // Look up store — by ObjectId first, then by slug
  const isObjectId = /^[a-f\d]{24}$/i.test(rawId);
  const store = (isObjectId
    ? await StoreModel.findById(rawId).select("_id tenantId userId slug").lean()
    : await StoreModel.findOne({ slug: rawId }).select("_id tenantId userId slug").lean()
  ) as { _id: unknown; tenantId: unknown; userId: unknown; slug: string } | null;

  if (!store) {
    res.status(404).json({ success: false, message: "Store not found", code: "STORE_NOT_FOUND" });
    return false;
  }

  const storeId = String(store._id);
  const isOwner = String(store.userId) === userId;

  if (isOwner) {
    req.storeContext = {
      storeId,
      tenantId: String(store.tenantId),
      isOwner: true,
      memberRole: "owner",
      memberPermissions: ["*"],
    };
    return true;
  }

  // Check team membership
  const member = await StoreMemberModel.findOne({ storeId, userId, status: "active" })
    .select("role permissions status")
    .lean() as { role: string; permissions: string[]; status: string } | null;

  if (!member) {
    res.status(403).json({ success: false, message: "You do not have access to this store", code: "STORE_ACCESS_DENIED" });
    return false;
  }

  // Merge role-based defaults + explicitly granted permissions
  const roleDefaults = roleToPermissions(member.role as any);
  const effectivePermissions = Array.from(new Set([...roleDefaults, ...member.permissions]));

  if (requiredPermission && !hasPermission(effectivePermissions, requiredPermission)) {
    res.status(403).json({
      success: false,
      message: `You do not have the required permission: ${requiredPermission}`,
      code: "PERMISSION_DENIED",
      required: requiredPermission,
    });
    return false;
  }

  req.storeContext = {
    storeId,
    tenantId: String(store.tenantId),
    isOwner: false,
    memberRole: member.role,
    memberPermissions: effectivePermissions,
  };
  return true;
}

/**
 * Middleware: Verify the caller has basic access to a store (owner OR active member).
 */
export async function requireStoreAccess(req: PermissionRequest, res: Response, next: NextFunction) {
  const ok = await resolveStoreAccess(req, res);
  if (ok) next();
}

/**
 * Middleware factory: Verify the caller has a specific permission on the store.
 *
 * Usage:  `router.post("/products", requireStorePermission("products:create"), handler)`
 */
export function requireStorePermission(permission: string) {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    const ok = await resolveStoreAccess(req, res, permission);
    if (ok) next();
  };
}

/**
 * Middleware factory: Verify the caller has ALL of the given permissions.
 */
export function requireAllStorePermissions(...permissions: string[]) {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    // Resolve access first without specific permission check
    const ok = await resolveStoreAccess(req, res);
    if (!ok) return;

    const { memberPermissions } = req.storeContext!;
    const missing = permissions.filter((p) => !hasPermission(memberPermissions, p));
    if (missing.length > 0) {
      return res.status(403).json({
        success: false,
        message: `Missing required permissions: ${missing.join(", ")}`,
        code: "PERMISSION_DENIED",
        required: permissions,
        missing,
      });
    }
    next();
  };
}
