import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { TenantModel } from "../../models/tenant.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";
import { TemplateModel } from "../../models/template.model.js";
import { PageModel } from "../../models/page.model.js";
import { ensureDefaultStoreSettings } from "./store-settings.service.js";
import { HomepageSliderModel } from "../../models/homepage-slider.model.js";
import { createStoreSchema, updateStoreSchema, updateStoreBrandingSchema, type CreateStoreInput, type UpdateStoreInput, type UpdateStoreBrandingInput } from "./store.validator.js";
import { ProductModel } from "../../models/product.model.js";
import { OrderModel } from "../../models/order.model.js";
import { applyTrialExpiryToStore, applySubscriptionExpiryToStore, buildTrialFields } from "./trial.service.js";
import { createTrialSubscription } from "../subscriptions/store-subscription.service.js";
import { createBillingNotification } from "../notifications/billing-notification.service.js";
import { getPlatformSettings } from "../settings/platform-settings.service.js";
import { requireObjectId } from "../../common/utils/object-id.js";
import { AuditLogModel } from "../../models/audit-log.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { CouponModel } from "../../models/coupon.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { CustomerModel } from "../../models/customer.model.js";
import { CartModel } from "../../models/cart.model.js";
import { WishlistModel } from "../../models/wishlist.model.js";
import { CollectionModel } from "../../models/collection.model.js";
import { PaymentMethodModel } from "../../models/payment-method.model.js";
import { DeliveryZoneModel } from "../../models/delivery-zone.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { StoreSubscriptionModel } from "../../models/store-subscription.model.js";
import { InvoiceModel } from "../../models/invoice.model.js";
import { CampaignModel } from "../../models/campaign.model.js";
import { TaxClassModel } from "../../models/tax-class.model.js";
import { ShippingZoneModel } from "../../models/shipping-zone.model.js";
import { CmsPageModel } from "../../models/cms-page.model.js";
import { FaqModel } from "../../models/faq.model.js";
import { BillingNotificationModel } from "../../models/billing-notification.model.js";
import { MediaFileModel } from "../../models/media-file.model.js";
import { StorageUsageModel } from "../../models/storage-usage.model.js";
import { NewsletterModel } from "../../models/newsletter.model.js";
import { SubscriptionPaymentModel } from "../../models/subscription-payment.model.js";
import { VisitorSessionModel } from "../analytics/visitor-session.model.js";
import { PageViewModel } from "../analytics/page-view.model.js";
import { TrafficSourceModel } from "../analytics/traffic-source.model.js";
import { DailyAnalyticModel } from "../analytics/daily-analytic.model.js";
import { MonthlyAnalyticModel } from "../analytics/monthly-analytic.model.js";
import { VisitorStatisticModel } from "../analytics/visitor-statistic.model.js";


// Cascade models
import { ProductVariantModel } from "../products/variants/product-variant.model.js";
import { ProductOptionModel } from "../products/variants/product-option.model.js";
import { ProductOptionValueModel } from "../products/variants/product-option-value.model.js";
import { VariantAttributesModel } from "../products/variants/variant-attributes.model.js";
import { VariantImageModel } from "../products/variants/variant-image.model.js";
import { VariantInventoryModel } from "../products/variants/variant-inventory.model.js";
import { VariantPriceModel } from "../products/variants/variant-price.model.js";
import { ProductQuestionModel } from "../products/product-question.model.js";
import { StockLogModel } from "../inventory/stock-log.model.js";
import { StorePageModel } from "../pages/store-page.model.js";
import { PageHistoryModel } from "../pages/page-history.model.js";
import { PageVersionModel } from "../pages/page-version.model.js";
import { BuilderTemplateModel } from "../builder/builder-template.model.js";
import { GlobalSectionModel } from "../builder/global-section.model.js";
import { NavigationModel } from "../navigation/navigation.model.js";   // ← was missing
import { MenuItemModel } from "../navigation/menu-item.model.js";
import { StoreUsageModel } from "../features/store-usage.model.js";
import { deleteStoreUploadFolder } from "../media/store-upload-cleanup.js";
import { MediaReferenceModel } from "../media/media-reference.model.js";


function safeId(id: string): mongoose.Types.ObjectId | null {
  return requireObjectId(id).ok ? new mongoose.Types.ObjectId(id) : null;
}

import { listPlans } from "../plans/plan.service.js";

async function ensurePlans() {
  await listPlans();
}

async function attachStoreMetrics(stores: any[]) {
  if (stores.length === 0) return stores;

  const storeObjectIds = stores.map((store) => store._id);

  const [productCounts, orderCounts, orderRevenue] = await Promise.all([
    ProductModel.aggregate([{ $match: { storeId: { $in: storeObjectIds } } }, { $group: { _id: "$storeId", count: { $sum: 1 } } }]),
    OrderModel.aggregate([{ $match: { storeId: { $in: storeObjectIds } } }, { $group: { _id: "$storeId", count: { $sum: 1 } } }]),
    OrderModel.aggregate([{ $match: { storeId: { $in: storeObjectIds }, status: { $ne: "cancelled" } } }, { $group: { _id: "$storeId", revenue: { $sum: "$total" } } }]),
  ]);

  const productCountMap = new Map(productCounts.map((entry: any) => [entry._id.toString(), entry.count]));
  const orderCountMap = new Map(orderCounts.map((entry: any) => [entry._id.toString(), entry.count]));
  const revenueMap = new Map(orderRevenue.map((entry: any) => [entry._id.toString(), entry.revenue]));

  return stores.map((store) => ({
    ...store,
    productCount: productCountMap.get(store._id.toString()) ?? 0,
    orderCount: orderCountMap.get(store._id.toString()) ?? 0,
    revenueBDT: revenueMap.get(store._id.toString()) ?? 0,
    // Storage comes from cached Store model fields (updated atomically via $inc on upload/delete)
    storageUsedBytes: store.storageUsedBytes ?? 0,
    storageLimitBytes: store.storageLimitBytes ?? 0,
  }));
}

export async function createStore(userId: string, payload: unknown) {
  const parsed = createStoreSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid store data" };

  await connectDatabase();
  await ensurePlans();

  const existingSlug = await StoreModel.findOne({ slug: parsed.data.slug });
  if (existingSlug) return { ok: false as const, message: "Store slug already taken" };

  const requestedPlan = (parsed.data.planId
    ? await PlanModel.findById(parsed.data.planId).lean()
    : await PlanModel.findOne({ slug: parsed.data.plan }).lean()) as { slug: string; _id: unknown } | null;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userTenants = await TeamMemberModel.find({ userId }).distinct("tenantId").session(session);
    let tenantId = userTenants[0];

    if (!tenantId) {
      const slug = `store-${Date.now()}`;
      const [tenant] = await TenantModel.create([{
        name: parsed.data.name,
        slug,
        subdomain: slug,
        plan: requestedPlan?.slug ?? parsed.data.plan ?? "free",
        status: "active"
      }], { session });
      tenantId = tenant._id;
      await TeamMemberModel.create([{ tenantId, userId, role: "owner", status: "active", invitedAt: new Date(), acceptedAt: new Date() }], { session });
    }

    let themeFromTemplate;
    let templateId;
    if (parsed.data.selectedTemplateId) {
      const template = await TemplateModel.findById(parsed.data.selectedTemplateId).session(session).lean() as any;
      if (template) {
        themeFromTemplate = template.theme;
        templateId = template._id;
      }
    }

    const trialFields = await buildTrialFields();
    const [store] = await StoreModel.create([{
      tenantId,
      userId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      subdomain: parsed.data.slug,
      description: parsed.data.description ?? "",
      shortName: parsed.data.shortName ?? "",
      tagline: parsed.data.tagline ?? "",
      category: parsed.data.category ?? "ecommerce",
      storeType: parsed.data.storeType ?? "ecommerce",
      plan: requestedPlan?.slug ?? parsed.data.plan ?? "free",
      ...(requestedPlan ? { planId: requestedPlan._id } : {}),
      ...trialFields,
      logoUrl: parsed.data.logoUrl ?? "",
      logoMediaId: parsed.data.logoMediaId ?? null,
      faviconUrl: parsed.data.faviconUrl ?? "",
      faviconMediaId: parsed.data.faviconMediaId ?? null,
      brandColor: parsed.data.brandColor ?? "#2563eb",
      accentColor: parsed.data.accentColor ?? "#0f172a",
      ...(templateId ? { selectedTemplateId: templateId } : {}),
      ...(themeFromTemplate ? { theme: themeFromTemplate } : {}),
    }], { session });

    if (templateId && themeFromTemplate) {
      await PageModel.deleteMany({ storeId: store._id }).session(session);
      await PageModel.create([{
        storeId: store._id,
        title: "Home",
        slug: "home",
        status: "published",
        sections: [],
        theme: themeFromTemplate
      }], { session });
    }

    await ensureDefaultStoreSettings(store._id.toString(), session);
    await HomepageSliderModel.deleteMany({ storeId: store._id }).session(session);
    await HomepageSliderModel.create([{
      storeId: store._id,
      title: `${store.name} essentials`,
      subtitle: "Fresh arrivals and best-selling picks ready for checkout.",
      imageUrl: `https://placehold.co/1600x900/png?text=${encodeURIComponent(store.name)}`,
      buttonText: "Shop Collection",
      buttonLink: "/shop",
      sortOrder: 1,
      isActive: true,
      overlayColor: "rgba(15, 23, 42, 0.45)",
      textAlignment: "left"
    }], { session });

    const planIdForTrial = requestedPlan?._id ?? (await PlanModel.findOne({ slug: "free" }).session(session).lean() as { _id: unknown } | null)?._id;
    if (planIdForTrial && trialFields.trialEndsAt) {
      await createTrialSubscription({
        tenantId: String(tenantId),
        storeId: String(store._id),
        userId,
        planId: String(planIdForTrial),
        trialStartedAt: trialFields.trialStartedAt!,
        trialEndsAt: trialFields.trialEndsAt,
      }, session);
      const settings = await getPlatformSettings();
      await createBillingNotification({
        userId,
        storeId: String(store._id),
        type: "trial_started",
        title: "Trial started",
        message: `Your store "${store.name}" trial has started (${settings.trialDays ?? 3} days).`,
      }, session);
    }

    await session.commitTransaction();
    return { ok: true as const, data: { store: store.toObject() } };
  } catch (error) {
    await session.abortTransaction();
    console.error("[store.service] createStore transaction failed:", error);
    return { ok: false as const, message: "Failed to create store. All changes have been rolled back." };
  } finally {
    session.endSession();
  }
}

export async function getUserStores(userId: string) {
  await connectDatabase();
  await ensurePlans();
  const stores = await StoreModel.find({ userId })
    .select("name slug subdomain description category storeType plan planId billingStatus subscriptionStatus renewalDate trialStartedAt trialEndsAt published allowNewOrders status logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor selectedTemplateId theme storageUsedBytes storageLimitBytes storageUpdatedAt createdAt updatedAt")
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
    .sort({ createdAt: -1 })
    .lean();

  // Fire-and-forget expiry checks (non-blocking)
  Promise.all(stores.map((store) =>
    Promise.all([
      applyTrialExpiryToStore(store).catch(() => {}),
      applySubscriptionExpiryToStore(store).catch(() => {}),
    ])
  )).catch(() => {});

  return { ok: true as const, data: { stores: await attachStoreMetrics(stores as any[]) } };
}

export async function getStoreById(storeId: string, userId: string) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: id, userId })
    .select("name slug subdomain description category storeType plan planId billingStatus subscriptionStatus renewalDate trialStartedAt trialEndsAt published allowNewOrders status logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor selectedTemplateId theme storageUsedBytes storageLimitBytes storageUpdatedAt createdAt updatedAt")
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  // Fire-and-forget expiry
  applyTrialExpiryToStore(store as any).catch(() => {});
  applySubscriptionExpiryToStore(store as any).catch(() => {});
  const [hydrated] = await attachStoreMetrics([store as any]);
  return { ok: true as const, data: { store: hydrated } };
}

export async function getStoreBySlug(slug: string, userId: string) {
  if (!slug) return { ok: false as const, message: "Store slug is required" };
  await connectDatabase();
  const store = await StoreModel.findOne({ slug, userId })
    .select("name slug subdomain description category storeType plan planId billingStatus subscriptionStatus renewalDate trialStartedAt trialEndsAt published allowNewOrders status logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor selectedTemplateId theme storageUsedBytes storageLimitBytes storageUpdatedAt createdAt updatedAt")
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  // Fire-and-forget expiry
  applyTrialExpiryToStore(store as any).catch(() => {});
  applySubscriptionExpiryToStore(store as any).catch(() => {});
  const [hydrated] = await attachStoreMetrics([store as any]);
  return { ok: true as const, data: { store: hydrated } };
}

export async function updateStore(storeId: string, userId: string, payload: unknown) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  const parsed = updateStoreSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid update data" };

  await connectDatabase();
  const store = await StoreModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed.data },
    { new: true }
  ).lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { store } };
}

export async function getStoreBranding(storeId: string, userId: string) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: id, userId })
    .select("name shortName tagline logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor plan planId")
    .populate("planId", "name slug")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { branding: store } };
}

export async function updateStoreBranding(storeId: string, userId: string, payload: unknown) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  const parsed = updateStoreBrandingSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid branding data" };

  await connectDatabase();
  const store = await StoreModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed.data },
    { new: true }
  )
    .select("name shortName tagline logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor plan planId")
    .populate("planId", "name slug")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { branding: store, store } };
}

export async function clearStoreBrandAsset(
  storeId: string,
  userId: string,
  asset: "logo" | "favicon"
) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  await connectDatabase();
  const update =
    asset === "logo"
      ? { logoUrl: "", logoMediaId: null }
      : { faviconUrl: "", faviconMediaId: null };
  const store = await StoreModel.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true })
    .select("name shortName tagline logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor plan planId")
    .populate("planId", "name slug")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { branding: store, store } };
}

export async function deleteStore(
  storeId: string,
  userId: string,
  onProgress?: (step: string, status: "pending" | "success" | "failed", error?: string) => void
): Promise<{ ok: false; message: string; code?: number } | { ok: true; data: { storeName: string; storeSlug: string; tenantId: string } }> {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID", code: 400 };

  await connectDatabase();

  // ── Pre-flight: load the store BEFORE the transaction so we have its
  //    metadata even if the transaction rolls back.
  const store = await StoreModel.findOne({ _id: id }).lean() as {
    _id: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  } | null;

  if (!store) return { ok: false as const, message: "Store not found", code: 404 };

  if (store.userId.toString() !== userId) {
    return { ok: false as const, message: "Unauthorized: You do not own this store", code: 403 };
  }

  const tenantId    = store.tenantId;
  const storeObj    = store._id;
  const storeName   = store.name;
  const storeSlug   = store.slug;

  // ── Helper: log + notify progress for a named step ──────────────────
  const step = async (label: string, fn: () => Promise<void>): Promise<void> => {
    if (onProgress) onProgress(label, "pending");
    console.log(`[deleteStore] Deleting ${label}...`);
    try {
      await fn();
      if (onProgress) onProgress(label, "success");
      console.log(`[deleteStore] ✓ ${label}`);
    } catch (err: any) {
      const msg: string = err?.message ?? String(err);
      console.error(`[deleteStore] ✗ ${label}: ${msg}`);
      if (onProgress) onProgress(label, "failed", msg);
      throw err; // re-throw so the transaction catch block fires
    }
  };

  // ── Single transaction, single session ──────────────────────────────
  // CRITICAL: every Model operation inside must be SEQUENTIAL (no
  // Promise.all).  Running concurrent ops on the same Mongoose session
  // inside a transaction causes:
  //   "MongoServerError: Given transaction number X does not match any
  //    in-progress transactions"
  // because the driver re-uses the same server connection and the ops
  // race to set/read the internal txnNumber field.
    const session = await mongoose.startSession();
  try {
    session.startTransaction();
    console.log(`[deleteStore] ── Transaction started for "${storeName}" (${storeObj}) ──`);

    // 1. Delete Products
    await step("Products", async () => {
      await ProductModel.deleteMany({ storeId: storeObj }).session(session);
      await ProductVariantModel.deleteMany({ storeId: storeObj }).session(session);
      await ProductOptionModel.deleteMany({ storeId: storeObj }).session(session);
      await ProductOptionValueModel.deleteMany({ storeId: storeObj }).session(session);
      await VariantAttributesModel.deleteMany({ storeId: storeObj }).session(session);
      await VariantImageModel.deleteMany({ storeId: storeObj }).session(session);
      await VariantInventoryModel.deleteMany({ storeId: storeObj }).session(session);
      await VariantPriceModel.deleteMany({ storeId: storeObj }).session(session);
      await ProductQuestionModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 2. Delete Categories
    await step("Categories", async () => {
      await CategoryModel.deleteMany({ storeId: storeObj }).session(session);
      await CollectionModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 3. Delete Inventory
    await step("Inventory", async () => {
      await StockLogModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 4. Delete Customers
    await step("Customers", async () => {
      await CustomerModel.deleteMany({ storeId: storeObj }).session(session);
      await CartModel.deleteMany({ storeId: storeObj }).session(session);
      await WishlistModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 5. Delete Orders
    await step("Orders", async () => {
      await OrderModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 6. Delete Reviews
    await step("Reviews", async () => {
      await ReviewModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 7. Delete Coupons
    await step("Coupons", async () => {
      await CouponModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 8. Delete Pages
    await step("Pages", async () => {
      await StorePageModel.deleteMany({ storeId: storeObj }).session(session);
      await PageHistoryModel.deleteMany({ storeId: storeObj }).session(session);
      await PageVersionModel.deleteMany({ storeId: storeObj }).session(session);
      await CmsPageModel.deleteMany({ storeId: storeObj }).session(session);
      await FaqModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 9. Delete Navigation
    await step("Navigation", async () => {
      await NavigationModel.deleteMany({ storeId: storeObj }).session(session);
      await MenuItemModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 10. Delete Builder Data
    await step("Builder Data", async () => {
      await BuilderTemplateModel.deleteMany({ storeId: storeObj }).session(session);
      await GlobalSectionModel.deleteMany({ storeId: storeObj }).session(session);
      await HomepageSliderModel.deleteMany({ storeId: storeObj }).session(session);
      await PageModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 11. Delete Theme (includes theme settings, billing, marketing, analytics, activity logs)
    await step("Theme", async () => {
      // Theme Settings / general Settings
      await StoreSettingsModel.deleteMany({ storeId: storeObj }).session(session);
      await PaymentMethodModel.deleteMany({ storeId: storeObj }).session(session);
      await DeliveryZoneModel.deleteMany({ storeId: storeObj }).session(session);
      await ShippingZoneModel.deleteMany({ storeId: storeObj }).session(session);
      await TaxClassModel.deleteMany({ storeId: storeObj }).session(session);

      // Billing / Subscriptions
      await StoreSubscriptionModel.deleteMany({ storeId: storeObj }).session(session);
      await InvoiceModel.deleteMany({ storeId: storeObj }).session(session);
      await SubscriptionPaymentModel.deleteMany({ storeId: storeObj }).session(session);
      await BillingNotificationModel.deleteMany({ storeId: storeObj }).session(session);

      // Marketing
      await CampaignModel.deleteMany({ storeId: storeObj }).session(session);
      await NewsletterModel.deleteMany({ storeId: storeObj }).session(session);

      // Analytics
      await VisitorSessionModel.deleteMany({ storeId: storeObj }).session(session);
      await PageViewModel.deleteMany({ storeId: storeObj }).session(session);
      await TrafficSourceModel.deleteMany({ storeId: storeObj }).session(session);
      await DailyAnalyticModel.deleteMany({ storeId: storeObj }).session(session);
      await MonthlyAnalyticModel.deleteMany({ storeId: storeObj }).session(session);
      await VisitorStatisticModel.deleteMany({ storeId: storeObj }).session(session);

      // Activity Logs
      await AuditLogModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 12. Delete Media records (MongoDB)
    await step("Media Records", async () => {
      await MediaFileModel.deleteMany({ storeId: storeObj }).session(session);
      await MediaReferenceModel.deleteMany({ storeId: storeObj }).session(session);
      await StorageUsageModel.deleteMany({ storeId: storeObj }).session(session);
      await StoreUsageModel.deleteMany({ storeId: storeObj }).session(session);
    });

    // 13. Delete Store document
    await step("Store", async () => {
      await StoreModel.deleteOne({ _id: storeObj }).session(session);
    });

    // ── Commit — called exactly once, only after all steps succeed ──
    await session.commitTransaction();
    console.log("[deleteStore] ── Transaction Committed ──");

    // 14. Delete physical upload folder (Non-blocking background task)
    // We run this after the transaction has committed so that filesystem/S3 slowness or failures
    // do not roll back the database transaction or cause request timeouts.
    if (onProgress) onProgress("Upload Folder", "pending");
    deleteStoreUploadFolder(storeSlug)
      .then((cleanupResult) => {
        if (cleanupResult.ok === false) {
          console.error(`[deleteStore] S3/Filesystem cleanup failed: ${cleanupResult.error}`);
          if (onProgress) onProgress("Upload Folder", "failed", cleanupResult.error);
        } else {
          console.log(`[deleteStore] S3/Filesystem cleanup succeeded: ${cleanupResult.skipped ? 'skipped' : 'deleted'}`);
          if (onProgress) onProgress("Upload Folder", "success");
        }
      })
      .catch((err) => {
        const msg = err?.message ?? String(err);
        console.error(`[deleteStore] S3/Filesystem cleanup error:`, msg);
        if (onProgress) onProgress("Upload Folder", "failed", msg);
      });

  } catch (err: any) {
    // ── Abort — called exactly once, only on failure ──────────────────
    await session.abortTransaction();
    console.error("[deleteStore] ── Transaction Aborted ──", err?.message ?? err);
    return {
      ok: false as const,
      code: 500,
      message: `Failed to delete store: ${err?.message ?? "Unknown database error"}. All changes have been rolled back.`,
    };
  } finally {
    // ── End session — called exactly once, always ─────────────────────
    session.endSession();
  }

  return {
    ok: true as const,
    data: { storeName, storeSlug, tenantId: String(tenantId) },
  };
}

export async function changeStoreTheme(storeId: string, userId: string, payload: { templateId?: string; theme?: Record<string, unknown> }) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: id, userId });
  if (!store) return { ok: false as const, message: "Store not found" };

  if (payload.templateId) {
    const template = await TemplateModel.findById(payload.templateId).lean() as any;
    if (!template) return { ok: false as const, message: "Template not found" };

    store.selectedTemplateId = template._id;
    if (template.theme) {
      store.theme = { ...store.theme.toObject?.() ?? store.theme, ...template.theme };
    }
    store.category = template.category ?? store.category;
  }

  if (payload.theme) {
    store.theme = { ...store.theme.toObject?.() ?? store.theme, ...payload.theme };
  }

  await store.save();
  const updated = await StoreModel.findById(store._id)
    .populate("selectedTemplateId", "name slug category preview")
    .lean();
  return { ok: true as const, data: { store: updated } };
}
