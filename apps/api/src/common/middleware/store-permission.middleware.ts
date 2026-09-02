import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { connectDatabase } from "../database/connection.js";
import { StoreModel } from "../../modules/stores/store.model.js";
import { StoreMemberModel } from "../../modules/team/store-member.model.js";
import { EmployeeModel } from "../../modules/hrm/employee.model.js";
import { hasPermission, roleToPermissions } from "../types/permissions.js";
import { checkStoreModuleEntitlement } from "../services/module-entitlement.service.js";

export type PermissionRequest = AuthRequest & {
  storeContext?: {
    storeId: string;
    tenantId: string;
    isOwner: boolean;
    memberRole: string;
    memberPermissions: string[];
    employeeId?: string;
    employeeCode?: string;
    enabledModules?: string[];
  };
};

/**
 * Maps a permission string to its corresponding module key (if restricted by subscription).
 */
function permissionToModule(permission: string): string | null {
  const [module] = permission.split(":");
  const moduleMap: Record<string, string> = {
    pos: "pos",
    inventory: "inventory",
    warehouse: "warehouse",
    procurement: "procurement",
    hrm: "hrm",
    analytics: "analytics",
    reports: "analytics",
    marketing: "marketing",
    shipping: "shipping",
    finance: "finance",
  };
  return moduleMap[module] || null;
}

/**
 * Core store access + permission + plan entitlement resolver.
 *
 * Authorization hierarchy:
 *  1. Super Admin → full access always.
 *  2. Store Exists & Active?
 *  3. Store Owner OR Active Member?
 *  4. Plan Entitlement for requested module / permission?
 *  5. Member Permission satisfied?
 */
async function resolveStoreAccess(
  req: PermissionRequest,
  res: Response,
  requiredPermission?: string,
  requiredModule?: string,
): Promise<boolean> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" });
    return false;
  }

  // Super admin bypasses all store-level permission and plan checks
  if (req.user?.role === "super_admin") {
    req.storeContext = {
      storeId: "super_admin",
      tenantId: "",
      isOwner: true,
      memberRole: "owner",
      memberPermissions: ["*"],
      enabledModules: ["*"],
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
    ? await StoreModel.findById(rawId).select("_id tenantId userId slug status planId").lean()
    : await StoreModel.findOne({ slug: rawId }).select("_id tenantId userId slug status planId").lean()
  ) as { _id: unknown; tenantId: unknown; userId: unknown; slug: string; status: string; planId?: unknown } | null;

  if (!store) {
    res.status(404).json({ success: false, message: "Store not found", code: "STORE_NOT_FOUND" });
    return false;
  }

  const storeId = String(store._id);
  const isOwner = String(store.userId) === userId;

  // Check module entitlement if a specific module or permission was requested
  const targetModule = requiredModule || (requiredPermission ? permissionToModule(requiredPermission) : null);
  if (targetModule) {
    const entitlement = await checkStoreModuleEntitlement(storeId, targetModule);
    if (!entitlement.entitled) {
      res.status(403).json({
        success: false,
        message: entitlement.message || `The ${targetModule} module is not enabled for your store.`,
        code: entitlement.code || "MODULE_NOT_ENTITLED",
        requiredModule: targetModule,
      });
      return false;
    }
  }

  // Look up linked employee profile (if any)
  let employeeId: string | undefined;
  let employeeCode: string | undefined;
  if (userId) {
    const emp = (await EmployeeModel.findOne({
      storeId,
      $or: [
        { userId },
        ...(req.user?.email ? [{ email: req.user.email.toLowerCase() }] : []),
      ],
    })
      .select("_id employeeCode userId")
      .lean()) as { _id: unknown; employeeCode: string; userId?: unknown } | null;

    if (emp) {
      employeeId = String(emp._id);
      employeeCode = emp.employeeCode;
      if (!emp.userId) {
        await EmployeeModel.updateOne({ _id: emp._id }, { $set: { userId } }).exec();
      }
    }
  }

  if (isOwner) {
    req.storeContext = {
      storeId,
      tenantId: String(store.tenantId),
      isOwner: true,
      memberRole: "owner",
      memberPermissions: ["*"],
      employeeId,
      employeeCode,
    };
    return true;
  }

  // Check team membership
  const member = (await StoreMemberModel.findOne({ storeId, userId, status: "active" })
    .select("role permissions status")
    .lean()) as { role: string; permissions: string[]; status: string } | null;

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
    employeeId,
    employeeCode,
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
 * Middleware factory: Verify the caller has either an administrative permission OR is acting on their own employee record.
 */
export function requireSelfOrPermission(
  adminPermission: string,
  getTargetEmployeeId: (req: PermissionRequest) => string | undefined,
) {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    const ok = await resolveStoreAccess(req, res);
    if (!ok) return;

    const targetEmployeeId = getTargetEmployeeId(req);
    const myEmployeeId = req.storeContext?.employeeId;
    const isSelf = Boolean(
      targetEmployeeId &&
      myEmployeeId &&
      String(targetEmployeeId) === String(myEmployeeId)
    );

    if (isSelf) {
      return next();
    }

    if (hasPermission(req.storeContext?.memberPermissions || [], adminPermission)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Access denied. You may only access your own records or require ${adminPermission}.`,
      code: "PERMISSION_DENIED",
    });
  };
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
 * Middleware factory: Verify the store has an active entitlement for a specific module.
 *
 * Usage: `router.use("/pos", requireStoreModule("pos"), posRouter)`
 */
export function requireStoreModule(moduleKey: string) {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    const ok = await resolveStoreAccess(req, res, undefined, moduleKey);
    if (ok) next();
  };
}

/**
 * Middleware factory: Verify the caller has ALL of the given permissions.
 */
export function requireAllStorePermissions(...permissions: string[]) {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
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

/**
 * Universal store access verification helper for controllers.
 * Supports both ObjectId and slug lookups and validates both Owners and active Team Members.
 */
export async function verifyStoreAccess(storeId: string, userId?: string): Promise<{ ok: boolean; storeId?: string }> {
  if (!userId || !storeId) return { ok: false };
  const isObjectId = /^[a-f\d]{24}$/i.test(storeId);
  const store = (isObjectId
    ? await StoreModel.findById(storeId).select("_id userId").lean()
    : await StoreModel.findOne({ slug: storeId }).select("_id userId").lean()) as { _id: unknown; userId: unknown } | null;
  if (!store) return { ok: false };
  const canonicalId = String(store._id);
  if (String(store.userId) === userId) return { ok: true, storeId: canonicalId };
  const member = await StoreMemberModel.findOne({ storeId: canonicalId, userId, status: "active" }).select("_id").lean();
  return { ok: Boolean(member), storeId: canonicalId };
}

/**
 * Helper to get the canonical authorized store ID from request storeContext or param.
 */
export function getAuthorizedStoreId(req: PermissionRequest): string {
  return req.storeContext?.storeId || String(req.params.storeId || req.params.id);
}
