import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { connectDatabase } from "../../common/database/connection.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { isValidObjectId } from "../../common/utils/object-id.js";
import { StoreModel } from "./store.model.js";
import { PlanModel } from "../plans/plan.model.js";
import { UserModel } from "../users/user.model.js";
import { StoreOverrideModel } from "./store-override.model.js";
import {
  getStoreOverride,
  upsertStoreOverride,
  deleteStoreOverride,
  buildEffectiveLimits,
  buildEffectiveFeatures,
  resolveStorageLimitMB,
} from "./store-override.service.js";
import { getStoreUsageReport, getStoreUsageForPlan } from "../plans/usage.service.js";
import { StorageUsageModel } from "../media/storage-usage.model.js";
import { MediaFileModel } from "../media/media-file.model.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";
import { OrderModel } from "../../models/order.model.js";
import { ProductModel } from "../../models/product.model.js";
import { CustomerModel } from "../../models/customer.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";

// ── Full store settings ───────────────────────────────────────
export async function getAdminStoreSettingsController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();

    const store = await StoreModel.findById(storeId)
      .populate("userId", "name email")
      .populate("planId", "name slug priceBDT")
      .lean() as Record<string, unknown> | null;

    if (!store) return sendFailure(response, "Store not found", 404);

    const override = await getStoreOverride(storeId);
    const usage = await getStoreUsageReport(storeId);

    const effectiveLimits = await buildEffectiveLimits(storeId);
    const effectiveFeatures = await buildEffectiveFeatures(storeId);
    const storage = await resolveStorageLimitMB(storeId);

    // Build override limits map with current override values
    const overrideLimits = (override as Record<string, unknown>)?.limits as Record<string, unknown> ?? {};
    const overrideFeatures = (override as Record<string, unknown>)?.featureOverrides as Record<string, unknown> ?? {};

    response.json({
      data: {
        store,
        override: override
          ? {
              limits: overrideLimits,
              featureOverrides: overrideFeatures,
              storageOverrideMB: (override as Record<string, unknown>).storageOverrideMB,
              storageUnlimited: (override as Record<string, unknown>).storageUnlimited,
              trialEnabled: (override as Record<string, unknown>).trialEnabled,
              trialEndsAt: (override as Record<string, unknown>).trialEndsAt,
              subscriptionStatusOverride: (override as Record<string, unknown>).subscriptionStatusOverride,
              billingStatusOverride: (override as Record<string, unknown>).billingStatusOverride,
              maintenanceMode: (override as Record<string, unknown>).maintenanceMode,
              loginDisabled: (override as Record<string, unknown>).loginDisabled,
              planId: (override as Record<string, unknown>).planId,
            }
          : null,
        usage,
        effectiveLimits,
        effectiveFeatures,
        storage,
      },
    });
  } catch (error) {
    console.error("getAdminStoreSettings error:", error);
    response.status(500).json({ message: "Failed to fetch store settings" });
  }
}

// ── Save overrides (single atomic upsert) ─────────────────────
export async function saveStoreOverridesController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    const userId = request.user?.userId;
    if (!userId) return sendFailure(response, "Unauthorized", 401);

    const {
      planId,
      limits,
      featureOverrides,
      storageOverrideMB,
      storageUnlimited,
      trialEnabled,
      trialEndsAt,
      subscriptionStatusOverride,
      billingStatusOverride,
      subscriptionExpiresAt,
      maintenanceMode,
      loginDisabled,
    } = request.body as Record<string, unknown>;

    // Build update payload, only including provided fields
    const update: Record<string, unknown> = {};
    if (planId !== undefined) {
      if (planId !== null && !isValidObjectId(String(planId))) {
        return sendFailure(response, "Invalid planId", 400);
      }
      update.planId = planId || null;
    }
    if (limits !== undefined) update.limits = limits;
    if (featureOverrides !== undefined) update.featureOverrides = featureOverrides;
    if (storageOverrideMB !== undefined) {
      if (storageOverrideMB !== null && Number(storageOverrideMB) < 0) {
        return sendFailure(response, "Storage override must be >= 0", 400);
      }
      update.storageOverrideMB = storageOverrideMB != null ? Number(storageOverrideMB) : null;
    }
    if (storageUnlimited !== undefined) update.storageUnlimited = Boolean(storageUnlimited);
    if (trialEnabled !== undefined) update.trialEnabled = Boolean(trialEnabled);
    if (trialEndsAt !== undefined) {
      if (trialEndsAt && isNaN(new Date(String(trialEndsAt)).getTime())) {
        return sendFailure(response, "Invalid trialEndsAt date", 400);
      }
      update.trialEndsAt = trialEndsAt || null;
    }
    if (subscriptionStatusOverride !== undefined) update.subscriptionStatusOverride = subscriptionStatusOverride || null;
    if (billingStatusOverride !== undefined) update.billingStatusOverride = billingStatusOverride || null;
    if (subscriptionExpiresAt !== undefined) update.subscriptionExpiresAt = subscriptionExpiresAt || null;
    if (maintenanceMode !== undefined) update.maintenanceMode = Boolean(maintenanceMode);
    if (loginDisabled !== undefined) update.loginDisabled = Boolean(loginDisabled);

    const updated = await upsertStoreOverride(storeId, update as any, String(userId));

    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_SETTINGS_UPDATED,
      module: AUDIT_MODULES.PLATFORM,
      entityType: "Store",
      entityId: storeId,
      storeId,
      newValue: update,
    });

    return sendSuccess(response, { override: updated }, "Store overrides saved");
  } catch (error) {
    console.error("saveStoreOverrides error:", error);
    response.status(500).json({ message: "Failed to save store overrides" });
  }
}

// ── Change store plan ─────────────────────────────────────────
export async function changeStorePlanController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }
    const userId = request.user?.userId;
    if (!userId) return sendFailure(response, "Unauthorized", 401);

    const { planId } = request.body as { planId?: string };
    if (!planId) {
      return sendFailure(response, "planId is required", 400);
    }
    if (!isValidObjectId(planId)) {
      return sendFailure(response, "Invalid planId", 400);
    }

    await connectDatabase();
    const plan = await PlanModel.findById(planId).lean();
    if (!plan) {
      return sendFailure(response, "Plan not found", 404);
    }

    // Update both the store doc and the override
    await StoreModel.findByIdAndUpdate(storeId, {
      planId,
      plan: (plan as Record<string, unknown>).slug,
    });

    // Also update override planId if override exists
    await upsertStoreOverride(storeId, { planId: planId as any }, String(userId));

    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_SETTINGS_UPDATED,
      module: AUDIT_MODULES.PLATFORM,
      entityType: "Store",
      entityId: storeId,
      storeId,
      newValue: { planId, plan: (plan as Record<string, unknown>).slug },
    });

    return sendSuccess(response, { plan }, "Store plan changed");
  } catch (error) {
    console.error("changeStorePlan error:", error);
    response.status(500).json({ message: "Failed to change plan" });
  }
}

// ── Trial management ──────────────────────────────────────────
export async function manageStoreTrialController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }
    const userId = request.user?.userId;
    if (!userId) return sendFailure(response, "Unauthorized", 401);

    const { action, days, endsAt } = request.body as {
      action: "extend" | "reduce" | "end" | "restart" | "disable" | "convert";
      days?: number;
      endsAt?: string;
    };

    await connectDatabase();
    const store = await StoreModel.findById(storeId).lean() as Record<string, unknown> | null;
    if (!store) return sendFailure(response, "Store not found", 404);

    const now = new Date();
    let trialUpdate: Record<string, unknown> = {};

    switch (action) {
      case "extend": {
        const currentEnd = (store.trialEndsAt as Date) || now;
        const extendMs = (days ?? 30) * 24 * 60 * 60 * 1000;
        trialUpdate.trialEndsAt = new Date(currentEnd.getTime() + extendMs);
        trialUpdate.trialEnabled = true;
        break;
      }
      case "reduce": {
        const currentEnd = (store.trialEndsAt as Date) || now;
        const reduceMs = (days ?? 7) * 24 * 60 * 60 * 1000;
        trialUpdate.trialEndsAt = new Date(Math.max(now.getTime(), currentEnd.getTime() - reduceMs));
        break;
      }
      case "end":
        trialUpdate.trialEndsAt = now;
        trialUpdate.trialEnabled = false;
        break;
      case "restart":
        trialUpdate.trialEnabled = true;
        trialUpdate.trialStartedAt = now;
        trialUpdate.trialEndsAt = new Date(now.getTime() + (days ?? 14) * 24 * 60 * 60 * 1000);
        break;
      case "disable":
        trialUpdate.trialEnabled = false;
        trialUpdate.trialEndsAt = now;
        break;
      case "convert": {
        const paidStatus = (store.billingStatus as string) === "trial" ? "active" : store.billingStatus;
        trialUpdate.trialEnabled = false;
        trialUpdate.billingStatusOverride = paidStatus;
        trialUpdate.subscriptionStatusOverride = "active";
        break;
      }
      default:
        return sendFailure(response, "Invalid action", 400);
    }

    // If specific endsAt provided, override
    if (endsAt) {
      if (isNaN(new Date(endsAt).getTime())) {
        return sendFailure(response, "Invalid date", 400);
      }
      trialUpdate.trialEndsAt = new Date(endsAt);
    }

    // Update store document
    await StoreModel.findByIdAndUpdate(storeId, {
      $set: {
        trialEndsAt: trialUpdate.trialEndsAt,
        trialStartedAt: trialUpdate.trialStartedAt ?? store.trialStartedAt,
      },
    });

    // Update override
    await upsertStoreOverride(storeId, trialUpdate as any, String(userId));

    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_SETTINGS_UPDATED,
      module: AUDIT_MODULES.PLATFORM,
      entityType: "Store",
      entityId: storeId,
      storeId,
      newValue: { trialAction: action, ...trialUpdate },
    });

    return sendSuccess(response, { trial: trialUpdate }, `Trial ${action}ed`);
  } catch (error) {
    console.error("manageStoreTrial error:", error);
    response.status(500).json({ message: "Failed to manage trial" });
  }
}

// ── Subscription management ───────────────────────────────────
export async function manageStoreSubscriptionController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }
    const userId = request.user?.userId;
    if (!userId) return sendFailure(response, "Unauthorized", 401);

    const { action } = request.body as { action: string };
    await connectDatabase();

    let subOverride: Record<string, unknown> = {};

    switch (action) {
      case "pause":
        subOverride.subscriptionStatusOverride = "paused";
        break;
      case "resume":
        subOverride.subscriptionStatusOverride = "active";
        break;
      case "suspend":
        subOverride.subscriptionStatusOverride = "suspended";
        break;
      case "cancel":
        subOverride.subscriptionStatusOverride = "cancelled";
        break;
      case "expire":
        subOverride.subscriptionStatusOverride = "expired";
        break;
      case "renew": {
        const plan = await PlanModel.findById((request.body as Record<string, unknown>).planId || null).lean() as Record<string, unknown> | null;
        const trialDays = (plan?.trialDays as number) ?? 30;
        subOverride.subscriptionStatusOverride = "active";
        subOverride.subscriptionExpiresAt = new Date(
          Date.now() + trialDays * 24 * 60 * 60 * 1000
        );
        break;
      }
      default:
        return sendFailure(response, "Invalid action", 400);
    }

    await upsertStoreOverride(storeId, subOverride as any, String(userId));

    // Also update store document directly for quick checks
    const storeUpdate: Record<string, unknown> = {};
    if (subOverride.subscriptionStatusOverride === "suspended") {
      storeUpdate.status = "suspended";
    } else if (subOverride.subscriptionStatusOverride === "active") {
      storeUpdate.status = "active";
    }
    if (Object.keys(storeUpdate).length > 0) {
      await StoreModel.findByIdAndUpdate(storeId, { $set: storeUpdate });
    }

    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_SETTINGS_UPDATED,
      module: AUDIT_MODULES.PLATFORM,
      entityType: "Store",
      entityId: storeId,
      storeId,
      newValue: { subscriptionAction: action },
    });

    return sendSuccess(response, { subscription: subOverride }, `Subscription ${action}ed`);
  } catch (error) {
    console.error("manageStoreSubscription error:", error);
    response.status(500).json({ message: "Failed to manage subscription" });
  }
}

// ── Reset operations ──────────────────────────────────────────
export async function resetStoreController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    const resetType = String(request.params.type ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();

    switch (resetType) {
      case "storage": {
        await StorageUsageModel.findOneAndUpdate(
          { storeId },
          { $set: { usedBytes: 0, fileCount: 0, imageCount: 0, documentCount: 0, videoCount: 0 } },
          { upsert: true }
        );
        break;
      }
      case "limits": {
        // Remove limits override so plan defaults take effect
        await StoreOverrideModel.findOneAndUpdate(
          { storeId },
          { $unset: { limits: "", featureOverrides: "", storageOverrideMB: "", storageUnlimited: "" } }
        );
        break;
      }
      case "cache":
        // Placeholder — clear any app-level cache
        break;
      case "builderCache":
        // Placeholder
        break;
      default:
        return sendFailure(response, "Invalid reset type", 400);
    }

    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.STORE_SETTINGS_UPDATED,
      module: AUDIT_MODULES.PLATFORM,
      entityType: "Store",
      entityId: storeId,
      storeId,
      newValue: { resetType },
    });

    return sendSuccess(response, { reset: resetType }, `${resetType} reset`);
  } catch (error) {
    console.error("resetStore error:", error);
    response.status(500).json({ message: "Failed to reset" });
  }
}

// ── Recalculate usage ─────────────────────────────────────────
export async function recalculateStoreController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();
    const usage = await getStoreUsageReport(storeId);

    // Re-sync storage usage
    const mediaFiles = await MediaFileModel.find({ storeId, isDeleted: { $ne: true } }).lean();
    const totalBytes = mediaFiles.reduce((sum, f) => sum + ((f as Record<string, unknown>).size as number || 0), 0);
    await StorageUsageModel.findOneAndUpdate(
      { storeId },
      {
        $set: {
          usedBytes: totalBytes,
          fileCount: mediaFiles.length,
        },
      },
      { upsert: true }
    );

    return sendSuccess(response, { usage }, "Usage recalculated");
  } catch (error) {
    console.error("recalculateStore error:", error);
    response.status(500).json({ message: "Failed to recalculate" });
  }
}

// ── Sync subscription ─────────────────────────────────────────
export async function syncStoreSubscriptionController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();
    const override = await getStoreOverride(storeId);
    const store = await StoreModel.findById(storeId).select("planId billingStatus subscriptionStatus status trialEndsAt").lean() as Record<string, unknown> | null;
    if (!store) return sendFailure(response, "Store not found", 404);

    // Build synced state
    const synced: Record<string, unknown> = {
      effectivePlanId: String((override as Record<string, unknown>)?.planId || store.planId || ""),
      effectiveBillingStatus: (override as Record<string, unknown>)?.billingStatusOverride || store.billingStatus,
      effectiveSubscriptionStatus: (override as Record<string, unknown>)?.subscriptionStatusOverride || store.subscriptionStatus,
      storeStatus: store.status,
    };

    return sendSuccess(response, { synced }, "Subscription synced");
  } catch (error) {
    console.error("syncStoreSubscription error:", error);
    response.status(500).json({ message: "Failed to sync subscription" });
  }
}

// ── Delete store (cascade) ────────────────────────────────────
export async function deleteAdminStoreController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();
    const store = await StoreModel.findById(storeId);
    if (!store) return sendFailure(response, "Store not found", 404);

    // Import deleteStore from service
    const { deleteStore } = await import("./store.service.js");
    const result = await deleteStore(
      storeId,
      String(request.user?.userId ?? "")
    );

    if (result.ok) {
      // Also delete the override
      await deleteStoreOverride(storeId);

      await recordAuditFromRequest(request, {
        action: AUDIT_ACTIONS.STORE_DELETED,
        module: AUDIT_MODULES.PLATFORM,
        entityType: "Store",
        entityId: storeId,
        storeId,
        newValue: { name: store.name, slug: store.slug },
      });

      return sendSuccess(response, null, "Store deleted permanently");
    }
    return sendFailure(response, result.message, 500);
  } catch (error) {
    console.error("deleteAdminStore error:", error);
    response.status(500).json({ message: "Failed to delete store" });
  }
}

// ── Staff management ──────────────────────────────────────────
export async function manageStoreStaffController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    const { action, teamMemberId, role, disableLogin } = request.body as {
      action: "remove" | "changeRole" | "disable" | "enable";
      teamMemberId?: string;
      role?: string;
      disableLogin?: boolean;
    };

    await connectDatabase();
    const store = await StoreModel.findById(storeId).select("tenantId").lean() as { tenantId?: unknown } | null;
    if (!store) return sendFailure(response, "Store not found", 404);
    if (!store.tenantId) return sendFailure(response, "Store has no tenant", 400);

    switch (action) {
      case "remove": {
        if (!teamMemberId || !isValidObjectId(teamMemberId)) {
          return sendFailure(response, "Invalid team member ID", 400);
        }
        await TeamMemberModel.findByIdAndDelete(teamMemberId);
        break;
      }
      case "changeRole": {
        if (!teamMemberId || !isValidObjectId(teamMemberId) || !role) {
          return sendFailure(response, "teamMemberId and role required", 400);
        }
        await TeamMemberModel.findByIdAndUpdate(teamMemberId, { $set: { role } });
        break;
      }
      case "disable":
      case "enable": {
        if (!teamMemberId || !isValidObjectId(teamMemberId)) {
          return sendFailure(response, "Invalid team member ID", 400);
        }
        await TeamMemberModel.findByIdAndUpdate(teamMemberId, {
          $set: { disabled: action === "disable" },
        });
        break;
      }
      default:
        return sendFailure(response, "Invalid action", 400);
    }

    return sendSuccess(response, null, `Staff ${action}ed`);
  } catch (error) {
    console.error("manageStoreStaff error:", error);
    response.status(500).json({ message: "Failed to manage staff" });
  }
}

// ── Store analytics / stats ───────────────────────────────────
export async function getAdminStoreStatsController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();
    const [totalRevenue, orderCount, productCount, customerCount, mediaCount] =
      await Promise.all([
        OrderModel.aggregate([
          { $match: { storeId: storeId as any, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        OrderModel.countDocuments({ storeId }),
        ProductModel.countDocuments({ storeId }),
        CustomerModel.countDocuments({ storeId }),
        MediaFileModel.countDocuments({ storeId, isDeleted: { $ne: true } }),
      ]);

    const monthlySales = await OrderModel.aggregate([
      { $match: { storeId: storeId as any } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    const bestSelling = await OrderModel.aggregate([
      { $match: { storeId: storeId as any } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    response.json({
      data: {
        revenue: totalRevenue[0]?.total ?? 0,
        orders: orderCount,
        products: productCount,
        customers: customerCount,
        media: mediaCount,
        monthlySales,
        bestSelling,
      },
    });
  } catch (error) {
    console.error("getAdminStoreStats error:", error);
    response.status(500).json({ message: "Failed to fetch stats" });
  }
}

// ── Media details for a store ─────────────────────────────────
export async function getAdminStoreMediaController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();
    const allMedia = await MediaFileModel.find({ storeId }).sort({ createdAt: -1 }).limit(50).lean();

    const imageCount = allMedia.filter(
      (m) => (m as Record<string, unknown>).mimeType as string
      ? ((m as Record<string, unknown>).mimeType as string).startsWith("image/")
      : false
    ).length;
    const videoCount = allMedia.filter(
      (m) => (m as Record<string, unknown>).mimeType as string
      ? ((m as Record<string, unknown>).mimeType as string).startsWith("video/")
      : false
    ).length;
    const docCount = allMedia.length - imageCount - videoCount;

    const storage = await StorageUsageModel.findOne({ storeId }).lean();

    response.json({
      data: {
        total: allMedia.length,
        imageCount,
        videoCount,
        docCount,
        storage,
        recentMedia: allMedia.slice(0, 20),
      },
    });
  } catch (error) {
    console.error("getAdminStoreMedia error:", error);
    response.status(500).json({ message: "Failed to fetch media" });
  }
}

// ── Recalculate limits ────────────────────────────────────────
export async function recalculateStoreLimitsController(
  request: AuthRequest,
  response: Response
) {
  try {
    const storeId = String(request.params.id ?? "");
    if (!isValidObjectId(storeId)) {
      return sendFailure(response, "Invalid store ID", 400);
    }

    await connectDatabase();
    const usage = await getStoreUsageForPlan(storeId);

    return sendSuccess(response, { usage }, "Limits recalculated");
  } catch (error) {
    console.error("recalculateStoreLimits error:", error);
    response.status(500).json({ message: "Failed to recalculate limits" });
  }
}
