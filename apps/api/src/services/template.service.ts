import { connectDatabase } from "../config/database.js";
import { TemplateModel } from "../models/template.model.js";
import { PageModel } from "../models/page.model.js";

export async function getAllTemplates() {
  await connectDatabase();
  const templates = await TemplateModel.find({ status: "published" }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { templates } };
}

export async function getAdminTemplates() {
  await connectDatabase();
  const templates = await TemplateModel.find().sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { templates } };
}

export async function getTemplateById(id: string) {
  await connectDatabase();
  const template = await TemplateModel.findById(id).lean() as any;
  if (!template) return { ok: false as const, message: "Template not found" };
  return { ok: true as const, data: { template } };
}

export async function createTemplate(payload: Record<string, unknown>) {
  await connectDatabase();
  const template = await TemplateModel.create(payload);
  return { ok: true as const, data: { template: template.toObject() } };
}

export async function updateTemplate(id: string, payload: Record<string, unknown>) {
  await connectDatabase();
  const template = await TemplateModel.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean() as any;
  if (!template) return { ok: false as const, message: "Template not found" };
  return { ok: true as const, data: { template } };
}

export async function deleteTemplate(id: string) {
  await connectDatabase();
  const template = await TemplateModel.findByIdAndDelete(id).lean() as any;
  if (!template) return { ok: false as const, message: "Template not found" };
  return { ok: true as const, message: "Template deleted" };
}

export async function applyTemplateToStore(storeId: string, templateId: string) {
  await connectDatabase();
  const template = await TemplateModel.findById(templateId).lean() as any;
  if (!template) return { ok: false as const, message: "Template not found" };

  const { StoreModel } = await import("../models/store.model.js");
  const store = await StoreModel.findByIdAndUpdate(
    storeId,
    {
      $set: {
        selectedTemplateId: template._id,
        theme: template.theme,
        category: template.category
      }
    },
    { new: true }
  ).lean() as any;

  if (!store) return { ok: false as const, message: "Store not found" };

  await PageModel.deleteMany({ storeId });
  await PageModel.create({
    storeId,
    title: "Home",
    slug: "home",
    status: "draft",
    sections: template.sections ?? [],
    theme: template.theme
  });

  return { ok: true as const, data: { store } };
}
