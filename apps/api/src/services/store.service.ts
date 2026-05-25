import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { PlanModel } from "../models/plan.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { TemplateModel } from "../models/template.model.js";
import { PageModel } from "../models/page.model.js";
import { seedDemoProducts } from "./product.service.js";
import { ensureDefaultStoreSettings } from "./store-settings.service.js";
import { HomepageSliderModel } from "../models/homepage-slider.model.js";
import { createStoreSchema, updateStoreSchema, type CreateStoreInput, type UpdateStoreInput } from "../validators/store.validator.js";
import { ProductModel } from "../models/product.model.js";
import { OrderModel } from "../models/order.model.js";

const defaultPlans = [
  {
    name: "Free",
    slug: "free",
    priceBDT: 0,
    trialDays: 14,
    features: ["1 store", "50 products", "Basic storefront"],
    limits: { stores: 1, products: 50, staff: 1, bandwidthGB: 2 },
    isRecommended: false,
    isActive: true
  },
  {
    name: "Starter",
    slug: "starter",
    priceBDT: 1499,
    trialDays: 14,
    features: ["5 stores", "Unlimited products", "Priority support"],
    limits: { stores: 5, products: 5000, staff: 3, bandwidthGB: 50 },
    isRecommended: true,
    isActive: true
  },
  {
    name: "Growth",
    slug: "growth",
    priceBDT: 3999,
    trialDays: 14,
    features: ["15 stores", "Automation tools", "Advanced reporting"],
    limits: { stores: 15, products: 25000, staff: 8, bandwidthGB: 200 },
    isRecommended: false,
    isActive: true
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    priceBDT: 12999,
    trialDays: 30,
    features: ["Unlimited stores", "Dedicated success manager", "SLA support"],
    limits: { stores: 999, products: 0, staff: 0, bandwidthGB: 0 },
    isRecommended: false,
    isActive: true
  }
] as const;

async function ensurePlans() {
  const existing = await PlanModel.countDocuments();
  if (existing > 0) return;
  await PlanModel.insertMany(defaultPlans);
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

  const requestedPlan = parsed.data.planId ? await PlanModel.findById(parsed.data.planId).lean() : await PlanModel.findOne({ slug: parsed.data.plan }).lean();

  const userTenants = await TeamMemberModel.find({ userId }).distinct("tenantId");
  let tenantId = userTenants[0];

  if (!tenantId) {
    const slug = `store-${Date.now()}`;
    const tenant = await TenantModel.create({
      name: parsed.data.name,
      slug,
      subdomain: slug,
      plan: requestedPlan?.slug ?? parsed.data.plan ?? "free",
      status: "active"
    });
    tenantId = tenant._id;
    await TeamMemberModel.create({ tenantId, userId, role: "owner", status: "active", invitedAt: new Date(), acceptedAt: new Date() });
  }

  let themeFromTemplate;
  let templateId;
  if (parsed.data.selectedTemplateId) {
    const template = await TemplateModel.findById(parsed.data.selectedTemplateId).lean() as any;
    if (template) {
      themeFromTemplate = template.theme;
      templateId = template._id;
    }
  }

  const store = await StoreModel.create({
    tenantId,
    userId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    subdomain: parsed.data.slug,
    description: parsed.data.description ?? "",
    category: parsed.data.category ?? "general",
    plan: requestedPlan?.slug ?? parsed.data.plan ?? "free",
    ...(requestedPlan ? {
      planId: requestedPlan._id,
      billingStatus: requestedPlan.priceBDT > 0 ? "active" : "trial",
      subscriptionStatus: requestedPlan.priceBDT > 0 ? "active" : "trialing",
      renewalDate: new Date(Date.now() + (requestedPlan.trialDays ?? 0) * 24 * 60 * 60 * 1000)
    } : {}),
    status: "active",
    logoUrl: parsed.data.logoUrl ?? "",
    ...(templateId ? { selectedTemplateId: templateId } : {}),
    ...(themeFromTemplate ? { theme: themeFromTemplate } : {})
  });

  if (templateId && themeFromTemplate) {
    await PageModel.deleteMany({ storeId: store._id });
    await PageModel.create({
      storeId: store._id,
      title: "Home",
      slug: "home",
      status: "published",
      sections: [],
      theme: themeFromTemplate
    });
  }

  await seedDemoProducts(store._id.toString());
  await ensureDefaultStoreSettings(store._id.toString());
  await HomepageSliderModel.deleteMany({ storeId: store._id });
  await HomepageSliderModel.insertMany([
    {
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
    }
  ]);

  return { ok: true as const, data: { store: store.toObject() } };
}

export async function getUserStores(userId: string) {
  await connectDatabase();
  await ensurePlans();
  const stores = await StoreModel.find({ userId })
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
    .sort({ createdAt: -1 })
    .lean();
  return { ok: true as const, data: { stores: await attachStoreMetrics(stores as any[]) } };
}

export async function getStoreById(storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId })
    .populate("selectedTemplateId", "name slug category preview")
    .populate("planId", "name slug priceBDT features limits trialDays isRecommended isActive")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  const [hydrated] = await attachStoreMetrics([store as any]);
  return { ok: true as const, data: { store: hydrated } };
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

export async function changeStoreTheme(storeId: string, userId: string, payload: { templateId?: string; theme?: Record<string, unknown> }) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId });
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
