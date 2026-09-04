import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { TenantModel } from "../../models/tenant.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";
import { StoreMemberModel } from "../team/store-member.model.js";
import { PageModel } from "../../models/page.model.js";
import { ensureDefaultStoreSettings } from "./store-settings.service.js";
import { ensureDefaultStoreContact } from "./store-contact.service.js";
import { ensureDefaultEmailConfig, ensureDefaultEmailTemplates, ensureDefaultEmailBranding } from "../email/index.js";
import { HomepageSliderModel } from "../../models/homepage-slider.model.js";
import { createStoreSchema, updateStoreSchema, updateStoreBrandingSchema, type CreateStoreInput, type UpdateStoreInput, type UpdateStoreBrandingInput } from "./store.validator.js";
import { canonicalizeBrandingMediaUrls } from "./store-branding-logo.js";
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
import { StoreEmailConfigModel } from "../../models/store-email-config.model.js";
import { StoreEmailTemplateModel } from "../../models/store-email-template.model.js";
import { StoreEmailBrandingModel } from "../../models/store-email-branding.model.js";
import { StoreEmailLogModel } from "../../models/store-email-log.model.js";
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

function formatCreateStoreError(error: unknown): string {
  const base = "Failed to create store. All changes have been rolled back.";
  if (process.env.NODE_ENV === "production") return base;
  const detail = error instanceof Error ? error.message : String(error);
  return `${base} ${detail}`;
}

import { listPlans } from "../plans/plan.service.js";

let plansEnsuredAt = 0;
async function ensurePlans() {
  const now = Date.now();
  if (now - plansEnsuredAt < 300_000) return; // 5 minute in-memory cache
  await listPlans();
  plansEnsuredAt = now;
}

type CachedStoreMetrics = {
  productCount: number;
  orderCount: number;
  revenueBDT: number;
  cachedAt: number;
};
const storeMetricsCache = new Map<string, CachedStoreMetrics>();
const METRICS_CACHE_TTL_MS = 30_000; // 30 seconds TTL

export function invalidateStoreMetricsCache(storeId?: string) {
  if (storeId) {
    storeMetricsCache.delete(storeId);
  } else {
    storeMetricsCache.clear();
  }
}

async function attachStoreMetrics(stores: any[]) {
  if (stores.length === 0) return stores;

  const now = Date.now();
  const missingStoreObjectIds: mongoose.Types.ObjectId[] = [];
  const resultMap = new Map<string, CachedStoreMetrics>();

  for (const store of stores) {
    const sId = store._id.toString();
    const cached = storeMetricsCache.get(sId);
    if (cached && now - cached.cachedAt < METRICS_CACHE_TTL_MS) {
      resultMap.set(sId, cached);
    } else {
      missingStoreObjectIds.push(store._id);
    }
  }

  if (missingStoreObjectIds.length > 0) {
    const typedStoreIds = missingStoreObjectIds.map((id) =>
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id.toString()) : id
    );

    const [productCounts, orderMetrics] = await Promise.all([
      ProductModel.aggregate([
        { $match: { storeId: { $in: typedStoreIds } } },
        { $group: { _id: "$storeId", count: { $sum: 1 } } },
      ]),
      OrderModel.aggregate([
        { $match: { storeId: { $in: typedStoreIds } } },
        {
          $group: {
            _id: "$storeId",
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $ne: ["$status", "cancelled"] }, "$total", 0],
              },
            },
          },
        },
      ]),
    ]);

    const productCountMap = new Map(productCounts.map((entry: any) => [entry._id.toString(), entry.count]));
    const orderCountMap = new Map(orderMetrics.map((entry: any) => [entry._id.toString(), entry.count]));
    const revenueMap = new Map(orderMetrics.map((entry: any) => [entry._id.toString(), entry.revenue]));

    for (const sObjId of missingStoreObjectIds) {
      const sId = sObjId.toString();
      const entry: CachedStoreMetrics = {
        productCount: productCountMap.get(sId) ?? 0,
        orderCount: orderCountMap.get(sId) ?? 0,
        revenueBDT: revenueMap.get(sId) ?? 0,
        cachedAt: now,
      };
      storeMetricsCache.set(sId, entry);
      resultMap.set(sId, entry);
    }
  }

  return stores.map((store) => {
    // Resolve storage limit from the populated plan if the cached field is 0
    let limitBytes = store.storageLimitBytes ?? 0;
    if (limitBytes <= 0) {
      const populatedPlan = store.planId && typeof store.planId === "object" ? (store.planId as Record<string, unknown>) : null;
      const planStorageMB = (populatedPlan?.limits as Record<string, unknown> | undefined)?.storage as number | undefined;
      if (planStorageMB != null && planStorageMB > 0) {
        limitBytes = planStorageMB * 1024 * 1024;
      }
    }

    const metrics = resultMap.get(store._id.toString()) ?? {
      productCount: 0,
      orderCount: 0,
      revenueBDT: 0,
      cachedAt: now,
    };

    return {
      ...store,
      productCount: metrics.productCount,
      orderCount: metrics.orderCount,
      revenueBDT: metrics.revenueBDT,
      storageUsedBytes: store.storageUsedBytes ?? 0,
      storageLimitBytes: limitBytes,
    };
  });
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
  const txnOpts = { session, ordered: true as const };
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
      }], txnOpts);
      tenantId = tenant._id;
      await TeamMemberModel.create([{ tenantId, userId, role: "owner", status: "active", invitedAt: new Date(), acceptedAt: new Date() }], txnOpts);
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
      ...(parsed.data.courierAccess
        ? { courierAccess: { providers: parsed.data.courierAccess.providers ?? [] } }
        : {}),
    }], txnOpts);

    const storeId = store._id;

    // ── Auto-create default pages (StorePageModel + PageModel) ────
    const ALL_DEFAULT_PAGES: Array<{ title: string; slug: string; pageType: string; description: string; sortOrder: number; isSystem: boolean; isHomePage?: boolean; status: string; hasSections: boolean }> = [
      { title: "Home", slug: "home", pageType: "home", description: "Your store homepage", sortOrder: 0, isSystem: true, isHomePage: true, status: "published", hasSections: true },
      { title: "Shop", slug: "shop", pageType: "shop", description: "Browse all products", sortOrder: 1, isSystem: true, status: "draft", hasSections: true },
      { title: "Categories", slug: "categories", pageType: "category", description: "Browse by category", sortOrder: 2, isSystem: true, status: "draft", hasSections: true },
      { title: "Product Template", slug: "product", pageType: "product", description: "Product detail layout", sortOrder: 3, isSystem: true, status: "draft", hasSections: false },
      { title: "Collection Template", slug: "collection", pageType: "collection", description: "Collection layout", sortOrder: 4, isSystem: true, status: "draft", hasSections: true },
      { title: "About Us", slug: "about", pageType: "about", description: "Learn about our store", sortOrder: 5, isSystem: true, status: "draft", hasSections: true },
      { title: "Contact", slug: "contact", pageType: "contact", description: "Get in touch", sortOrder: 6, isSystem: true, status: "draft", hasSections: true },
      { title: "FAQ", slug: "faq", pageType: "faq", description: "Frequently asked questions", sortOrder: 7, isSystem: true, status: "draft", hasSections: true },
      { title: "Blog", slug: "blog", pageType: "blog", description: "Latest news & articles", sortOrder: 8, isSystem: true, status: "draft", hasSections: true },
      { title: "Cart", slug: "cart", pageType: "cart", description: "Shopping cart", sortOrder: 9, isSystem: true, status: "draft", hasSections: false },
      { title: "Checkout", slug: "checkout", pageType: "checkout", description: "Checkout", sortOrder: 10, isSystem: true, status: "draft", hasSections: false },
      { title: "Wishlist", slug: "wishlist", pageType: "wishlist", description: "Your wishlist", sortOrder: 11, isSystem: true, status: "draft", hasSections: false },
      { title: "Account", slug: "account", pageType: "account", description: "My account", sortOrder: 12, isSystem: true, status: "draft", hasSections: false },
      { title: "Search", slug: "search", pageType: "search", description: "Search results", sortOrder: 13, isSystem: true, status: "draft", hasSections: false },
      { title: "404", slug: "404", pageType: "custom", description: "Page not found", sortOrder: 14, isSystem: true, status: "draft", hasSections: false },
      { title: "Privacy Policy", slug: "privacy-policy", pageType: "privacy_policy", description: "Privacy policy", sortOrder: 15, isSystem: true, status: "draft", hasSections: false },
      { title: "Terms & Conditions", slug: "terms-conditions", pageType: "terms_conditions", description: "Terms & conditions", sortOrder: 16, isSystem: true, status: "draft", hasSections: false },
    ];

    // StorePageModel docs (storefront-facing)
    await StorePageModel.create(
      ALL_DEFAULT_PAGES.map((p) => ({
        storeId,
        tenantId,
        title: p.title,
        slug: p.isHomePage ? "/" : `/${p.slug}`,
        pageType: p.pageType,
        isSystem: p.isSystem,
        isHomePage: p.isHomePage ?? false,
        status: p.status,
        description: p.description,
        sortOrder: p.sortOrder,
        sections: [],
        settings: { layoutWidth: "1200px" },
        seo: { title: p.title, description: p.description },
      })),
      txnOpts
    );

    // PageModel docs (builder-facing)
    const homeSections = [
      { id: "hero-banner-1", type: "hero-banner", label: "Hero Banner", visible: true, props: { headline: "Welcome to Our Store", subheadline: "Discover amazing products curated just for you", buttonText: "Shop Now", buttonLink: "/shop", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", textAlignment: "left", heroHeight: "md", kicker: "Welcome" } },
      { id: "category-grid-1", type: "category-grid", label: "Categories", visible: true, props: { title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4" } },
      { id: "featured-products-1", type: "featured-products", label: "Featured Products", visible: true, props: { title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4", showBadges: "true", showRatings: "true" } },
      { id: "testimonials-1", type: "testimonials", label: "Testimonials", visible: true, props: { title: "What Customers Say", subtitle: "Hear from our happy customers", layout: "grid", cardStyle: "default", avatarStyle: "circle" } },
      { id: "newsletter-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Stay in the Loop", subheadline: "Subscribe to get exclusive deals.", buttonText: "Subscribe", placeholderText: "Enter your email" } },
    ];

    await PageModel.create(
      ALL_DEFAULT_PAGES.map((p) => ({
        storeId,
        title: p.title,
        slug: p.slug,
        pageType: p.pageType,
        isHome: p.isHomePage ?? false,
        showHeader: true,
        showFooter: true,
        status: p.status,
        sections: p.hasSections && p.pageType === "home" ? homeSections : [],
        theme: store.theme ?? {},
      })),
      txnOpts
    );

    // ── Auto-create default navigations ───────────────────────────
    const NAV_KEYS = ["primary", "footer", "mobile", "top_bar", "account", "sidebar"] as const;
    const NAV_LABELS: Record<string, string> = {
      primary: "Primary Navigation", footer: "Footer Navigation", mobile: "Mobile Navigation",
      top_bar: "Top Bar Navigation", account: "Account Navigation", sidebar: "Sidebar Navigation",
    };
    for (const key of NAV_KEYS) {
      await NavigationModel.findOneAndUpdate(
        { storeId, key },
        { $setOnInsert: { storeId, key, label: NAV_LABELS[key] ?? key, isActive: key === "primary" || key === "footer" || key === "mobile", sortOrder: NAV_KEYS.indexOf(key) } },
        { new: true, upsert: true, session }
      ).lean();
    }

    // ── Add default menu items for primary nav ────────────────────
    const primaryNav = await NavigationModel.findOne({ storeId, key: "primary" }).session(session).lean();
    if (primaryNav) {
      const primaryNavId = (primaryNav as { _id: unknown })._id;
      await MenuItemModel.insertMany([
        { navigationId: primaryNavId, storeId, title: "Home", link: "/", linkType: "page", sortOrder: 0 },
        { navigationId: primaryNavId, storeId, title: "Shop", link: "/shop", linkType: "page", sortOrder: 1 },
        { navigationId: primaryNavId, storeId, title: "Categories", link: "/categories", linkType: "page", sortOrder: 2 },
        { navigationId: primaryNavId, storeId, title: "About", link: "/about", linkType: "page", sortOrder: 3 },
        { navigationId: primaryNavId, storeId, title: "Contact", link: "/contact", linkType: "page", sortOrder: 4 },
        { navigationId: primaryNavId, storeId, title: "Blog", link: "/blog", linkType: "page", sortOrder: 5 },
        { navigationId: primaryNavId, storeId, title: "FAQ", link: "/faq", linkType: "page", sortOrder: 6 },
      ], txnOpts);
    }

    await ensureDefaultStoreSettings(store._id.toString(), session);
    await ensureDefaultStoreContact(store._id.toString(), session);
    await ensureDefaultEmailConfig(store._id.toString(), session);
    await ensureDefaultEmailTemplates(store._id.toString(), session);
    await ensureDefaultEmailBranding(store._id.toString(), session);
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
    }], txnOpts);

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
    console.error("[createStore]", error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return { ok: false as const, message: formatCreateStoreError(error) };
  } finally {
    session.endSession();
  }
}

export async function getUserStores(userId: string) {
  await connectDatabase();
  await ensurePlans();

  const storeMemberStoreIds = await StoreMemberModel.find({ userId, status: "active" }).distinct("storeId");

  const stores = await StoreModel.find({
    $or: [
      { userId },
      ...(storeMemberStoreIds.length ? [{ _id: { $in: storeMemberStoreIds } }] : []),
    ],
    status: { $ne: "archived" },
  })
    .select("name slug subdomain description category storeType plan planId billingStatus subscriptionStatus renewalDate trialStartedAt trialEndsAt published allowNewOrders status logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor theme storageUsedBytes storageLimitBytes storageUpdatedAt createdAt updatedAt")
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

export async function getStoreById(storeIdOrSlug: string, userId: string, userRole?: string) {
  if (!storeIdOrSlug) return { ok: false as const, message: "Invalid store identifier" };
  await connectDatabase();
  await ensurePlans();

  const id = safeId(storeIdOrSlug);
  const identifierCondition = id
    ? { _id: id }
    : {
        $or: [
          { slug: storeIdOrSlug },
          { slug: storeIdOrSlug.toLowerCase() },
          { subdomain: storeIdOrSlug },
          { subdomain: storeIdOrSlug.toLowerCase() },
        ],
      };

  const storeFields =
    "name slug subdomain description category storeType plan planId billingStatus subscriptionStatus renewalDate trialStartedAt trialEndsAt published allowNewOrders status logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor theme storageUsedBytes storageLimitBytes storageUpdatedAt createdAt updatedAt tenantId userId";

  // 1. Direct owner match
  let store = await StoreModel.findOne({ ...identifierCondition, userId })
    .select(storeFields)
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
    .lean();

  // 2. Active StoreMember match
  if (!store) {
    const memberStoreIds = await StoreMemberModel.find({ userId, status: "active" }).distinct("storeId");
    if (memberStoreIds.length > 0) {
      store = await StoreModel.findOne({
        $and: [identifierCondition, { _id: { $in: memberStoreIds } }],
      })
        .select(storeFields)
        .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
        .lean();
    }
  }

  // 3. Team member tenant match
  if (!store) {
    const userTenants = await TeamMemberModel.find({ userId }).distinct("tenantId");
    if (userTenants.length > 0) {
      store = await StoreModel.findOne({
        $and: [identifierCondition, { tenantId: { $in: userTenants } }],
      })
        .select(storeFields)
        .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
        .lean();
    }
  }

  // 4. Platform Super Admin match
  if (!store && userRole === "super_admin") {
    store = await StoreModel.findOne(identifierCondition)
      .select(storeFields)
      .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
      .lean();
  }

  if (!store) return { ok: false as const, message: "Store not found or access denied" };

  // Fire-and-forget expiry
  applyTrialExpiryToStore(store as any).catch(() => {});
  applySubscriptionExpiryToStore(store as any).catch(() => {});
  const [hydrated] = await attachStoreMetrics([store as any]);
  return { ok: true as const, data: { store: hydrated } };
}

export async function getStoreBySlug(slug: string, userId: string) {
  return getStoreById(slug, userId);
}

export async function updateStore(storeId: string, userId: string, payload: unknown) {
  const id = safeId(storeId);
  if (!id) return { ok: false as const, message: "Invalid store ID" };
  const parsed = updateStoreSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid update data" };

  // Courier provider assignment is admin-only via /stores/:id/couriers/access
  const { courierAccess: _courierAccess, ...safeData } = parsed.data;

  await connectDatabase();
  const store = await StoreModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: safeData },
    { new: true }
  ).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(String(id)).catch(() => {});

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
  const branding = await canonicalizeBrandingMediaUrls(parsed.data);
  const store = await StoreModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: branding },
    { new: true }
  )
    .select("name shortName tagline logoUrl logoMediaId faviconUrl faviconMediaId brandColor accentColor plan planId")
    .populate("planId", "name slug")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(String(id)).catch(() => {});

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

  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(String(id)).catch(() => {});

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
      await StoreEmailConfigModel.deleteMany({ storeId: storeObj }).session(session);
      await StoreEmailTemplateModel.deleteMany({ storeId: storeObj }).session(session);
      await StoreEmailBrandingModel.deleteMany({ storeId: storeObj }).session(session);
      await StoreEmailLogModel.deleteMany({ storeId: storeObj }).session(session);
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

export async function changeStoreTheme(
  storeIdOrSlug: string,
  userId: string,
  payload: { templateId?: string; theme?: Record<string, unknown>; sections?: unknown[] }
) {
  if (!storeIdOrSlug) return { ok: false as const, message: "Invalid store identifier" };
  await connectDatabase();

  const id = safeId(storeIdOrSlug);
  const identifierCondition = id
    ? { _id: id }
    : {
        $or: [
          { slug: storeIdOrSlug },
          { slug: storeIdOrSlug.toLowerCase() },
          { subdomain: storeIdOrSlug },
          { subdomain: storeIdOrSlug.toLowerCase() },
        ],
      };

  let store = await StoreModel.findOne({ ...identifierCondition, userId });
  if (!store) {
    const userTenants = await TeamMemberModel.find({ userId }).distinct("tenantId");
    store = await StoreModel.findOne({
      $and: [
        identifierCondition,
        { $or: [{ userId }, { tenantId: { $in: userTenants } }] },
      ],
    });
  }
  if (!store) {
    store = await StoreModel.findOne(identifierCondition);
  }

  if (!store) return { ok: false as const, message: "Store not found" };

  if (payload.templateId) {
    const { BuilderTemplateModel } = await import("../builder/builder-template.model.js");
    const template = (await BuilderTemplateModel.findById(payload.templateId).lean()) as any;
    if (!template) return { ok: false as const, message: "Template not found" };

    if (template.theme) {
      const current =
        typeof store.theme?.toObject === "function"
          ? store.theme.toObject()
          : { ...(store.theme ?? {}) };
      store.set("theme", { ...current, ...template.theme });
      store.markModified("theme");
    }
    store.category = template.category ?? store.category;
  }

  if (payload.theme) {
    const current =
      typeof store.theme?.toObject === "function"
        ? store.theme.toObject()
        : { ...(store.theme ?? {}) };
    store.set("theme", { ...current, ...payload.theme });
    store.markModified("theme");
  }

  await store.save();

  // If sections are provided (e.g. from theme default sections / AI generation), sync all home page models!
  if (payload.sections && Array.isArray(payload.sections) && payload.sections.length > 0) {
    const { StorePageModel } = await import("../pages/store-page.model.js");
    const updateResult = await StorePageModel.updateMany(
      {
        storeId: store._id,
        $or: [{ isHomePage: true }, { slug: "/" }, { slug: "home" }, { slug: "/home" }],
      },
      {
        $set: {
          sections: payload.sections,
          status: "published",
        },
      }
    );

    // If no matching home page existed in StorePageModel, create one
    if (updateResult.matchedCount === 0) {
      await StorePageModel.create({
        storeId: store._id,
        title: "Home",
        slug: "/",
        pageType: "home",
        isSystem: true,
        isHomePage: true,
        status: "published",
        sections: payload.sections,
      });
    }

    // Also sync PageModel (legacy builder model) if present
    try {
      const { PageModel } = await import("../../models/page.model.js");
      await PageModel.updateMany(
        {
          storeId: store._id,
          $or: [{ isHome: true }, { isHomePage: true }, { slug: "/" }, { slug: "home" }],
        },
        {
          $set: {
            sections: payload.sections,
          },
        }
      );
    } catch {
      // Non-critical
    }
  }

  const updated = await StoreModel.findById(store._id).lean();
  return { ok: true as const, data: { store: updated } };
}
