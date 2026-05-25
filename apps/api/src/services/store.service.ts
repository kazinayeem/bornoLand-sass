import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { TemplateModel } from "../models/template.model.js";
import { PageModel } from "../models/page.model.js";
import { seedDemoProducts } from "./product.service.js";
import { ensureDefaultStoreSettings } from "./store-settings.service.js";
import { HomepageSliderModel } from "../models/homepage-slider.model.js";
import { createStoreSchema, updateStoreSchema, type CreateStoreInput, type UpdateStoreInput } from "../validators/store.validator.js";

export async function createStore(userId: string, payload: unknown) {
  const parsed = createStoreSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid store data" };

  await connectDatabase();

  const existingSlug = await StoreModel.findOne({ slug: parsed.data.slug });
  if (existingSlug) return { ok: false as const, message: "Store slug already taken" };

  const userTenants = await TeamMemberModel.find({ userId }).distinct("tenantId");
  let tenantId = userTenants[0];

  if (!tenantId) {
    const slug = `store-${Date.now()}`;
    const tenant = await TenantModel.create({
      name: parsed.data.name,
      slug,
      subdomain: slug,
      plan: parsed.data.plan ?? "free",
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
    plan: parsed.data.plan ?? "free",
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
  const stores = await StoreModel.find({ userId })
    .populate("selectedTemplateId", "name slug category preview")
    .sort({ createdAt: -1 })
    .lean();
  return { ok: true as const, data: { stores } };
}

export async function getStoreById(storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId })
    .populate("selectedTemplateId", "name slug category preview")
    .lean();
  if (!store) return { ok: false as const, message: "Store not found" };
  return { ok: true as const, data: { store } };
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
