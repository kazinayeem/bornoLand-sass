import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { TenantModel } from "../../models/tenant.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";
import { TemplateModel } from "../../models/template.model.js";
import { PageModel } from "../../models/page.model.js";
import { seedDemoProducts } from "../products/product.service.js";
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
import fs from "node:fs/promises";
import path from "node:path";

function safeId(id: string): mongoose.Types.ObjectId | null {
  return requireObjectId(id).ok ? new mongoose.Types.ObjectId(id) : null;
}

import { listPlans } from "../plans/plan.service.js";

async function ensurePlans() {
  await listPlans();
}

async function attachStoreMetrics(stores: any[]) {
  const storeIds = stores.map((store) => store._id.toString());
  if (storeIds.length === 0) return stores;

  const [productCounts, orderCounts, orderRevenue] = await Promise.all([
    ProductModel.aggregate([{ $match: { storeId: { $in: stores.map((store) => store._id) } } }, { $group: { _id: "$storeId", count: { $sum: 1 } } }]),
    OrderModel.aggregate([{ $match: { storeId: { $in: stores.map((store) => store._id) } } }, { $group: { _id: "$storeId", count: { $sum: 1 } } }]),
    OrderModel.aggregate([{ $match: { storeId: { $in: stores.map((store) => store._id) }, status: { $ne: "cancelled" } } }, { $group: { _id: "$storeId", revenue: { $sum: "$total" } } }])
  ]);

  const productCountMap = new Map(productCounts.map((entry: any) => [entry._id.toString(), entry.count]));
  const orderCountMap = new Map(orderCounts.map((entry: any) => [entry._id.toString(), entry.count]));
  const revenueMap = new Map(orderRevenue.map((entry: any) => [entry._id.toString(), entry.revenue]));

  return stores.map((store) => ({
    ...store,
    productCount: productCountMap.get(store._id.toString()) ?? 0,
    orderCount: orderCountMap.get(store._id.toString()) ?? 0,
    revenueBDT: revenueMap.get(store._id.toString()) ?? 0
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

    await seedDemoProducts(store._id.toString(), session);
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
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
    .sort({ createdAt: -1 });

  for (const store of stores) {
    await applyTrialExpiryToStore(store);
    await applySubscriptionExpiryToStore(store);
  }

  const leanStores = stores.map((store) => store.toObject());
  return { ok: true as const, data: { stores: await attachStoreMetrics(leanStores as any[]) } };
}

export async function getStoreById(storeId: string, userId: string) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: id, userId })
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive");
  if (!store) return { ok: false as const, message: "Store not found" };
  await applyTrialExpiryToStore(store);
  await applySubscriptionExpiryToStore(store);
  const leanStore = store.toObject();
  const [hydrated] = await attachStoreMetrics([leanStore as any]);
  return { ok: true as const, data: { store: hydrated } };
}

export async function getStoreBySlug(slug: string, userId: string) {
  if (!slug) return { ok: false as const, message: "Store slug is required" };
  await connectDatabase();
  const store = await StoreModel.findOne({ slug, userId })
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive");
  if (!store) return { ok: false as const, message: "Store not found" };
  await applyTrialExpiryToStore(store);
  await applySubscriptionExpiryToStore(store);
  const leanStore = store.toObject();
  const [hydrated] = await attachStoreMetrics([leanStore as any]);
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

export async function deleteStore(storeId: string, userId: string): Promise<{ ok: false; message: string } | { ok: true; data: { storeName: string; storeSlug: string; tenantId: string } }> {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };

  await connectDatabase();

  const store = await StoreModel.findOne({ _id: id, userId }).lean() as { _id: mongoose.Types.ObjectId; tenantId: mongoose.Types.ObjectId; name: string; slug: string } | null;
  if (!store) return { ok: false as const, message: "Store not found" };

  const tenantId = store.tenantId;
  const storeObjectId = store._id;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // ── 1. Delete all store-associated data in parallel ──────────────
    await Promise.all([
      ProductModel.deleteMany({ storeId: storeObjectId }).session(session),
      OrderModel.deleteMany({ storeId: storeObjectId }).session(session),
      CategoryModel.deleteMany({ storeId: storeObjectId }).session(session),
      CouponModel.deleteMany({ storeId: storeObjectId }).session(session),
      ReviewModel.deleteMany({ storeId: storeObjectId }).session(session),
      CustomerModel.deleteMany({ storeId: storeObjectId }).session(session),
      CartModel.deleteMany({ storeId: storeObjectId }).session(session),
      WishlistModel.deleteMany({ storeId: storeObjectId }).session(session),
      CollectionModel.deleteMany({ storeId: storeObjectId }).session(session),
      PageModel.deleteMany({ storeId: storeObjectId }).session(session),
      HomepageSliderModel.deleteMany({ storeId: storeObjectId }).session(session),
      PaymentMethodModel.deleteMany({ storeId: storeObjectId }).session(session),
      DeliveryZoneModel.deleteMany({ storeId: storeObjectId }).session(session),
      StoreSettingsModel.deleteMany({ storeId: storeObjectId }).session(session),
      StoreSubscriptionModel.deleteMany({ storeId: storeObjectId }).session(session),
      InvoiceModel.deleteMany({ storeId: storeObjectId }).session(session),
      SubscriptionPaymentModel.deleteMany({ storeId: storeObjectId }).session(session),
      CampaignModel.deleteMany({ storeId: storeObjectId }).session(session),
      TaxClassModel.deleteMany({ storeId: storeObjectId }).session(session),
      ShippingZoneModel.deleteMany({ storeId: storeObjectId }).session(session),
      CmsPageModel.deleteMany({ storeId: storeObjectId }).session(session),
      FaqModel.deleteMany({ storeId: storeObjectId }).session(session),
      BillingNotificationModel.deleteMany({ storeId: storeObjectId }).session(session),
      MediaFileModel.deleteMany({ storeId: storeObjectId }).session(session),
      StorageUsageModel.deleteMany({ storeId: storeObjectId }).session(session),
      NewsletterModel.deleteMany({ storeId: storeObjectId }).session(session),
      AuditLogModel.deleteMany({ storeId: storeObjectId }).session(session),
    ]);

    // ── 2. Delete the store itself ──────────────────────────────────
    await StoreModel.deleteOne({ _id: storeObjectId }).session(session);

    await session.commitTransaction();

    // ── 3. Delete files from disk (outside transaction) ────────────
    try {
      const mediaDir = path.resolve(process.cwd(), "public/uploads", store.slug);
      await fs.rm(mediaDir, { recursive: true, force: true });
    } catch {
      // non-critical — files may already be gone or stored on S3
    }

    return {
      ok: true as const,
      data: {
        storeName: store.name,
        storeSlug: store.slug,
        tenantId: String(tenantId),
      },
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("[store.service] deleteStore transaction failed:", error);
    return { ok: false as const, message: "Failed to delete store. All changes have been rolled back." };
  } finally {
    session.endSession();
  }
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
