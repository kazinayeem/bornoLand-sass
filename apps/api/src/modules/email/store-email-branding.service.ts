import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreEmailBrandingModel } from "./store-email-branding.model.js";
import { updateEmailBrandingSchema } from "./store-email-branding.validator.js";

const defaultBranding = {
  logo: "",
  primaryColor: "#0066cc",
  buttonColor: "#0066cc",
  footer: "",
  socialLinks: { facebook: "", instagram: "", x: "", linkedin: "", youtube: "" },
  website: "",
  supportEmail: "",
  phone: "",
  address: "",
} as const;

function serializeBranding(doc: Record<string, unknown> | null | undefined, storeId: string) {
  const social = (doc?.socialLinks as Record<string, unknown> | undefined) ?? {};
  return {
    _id: doc?._id ? String(doc._id) : undefined,
    storeId: String(doc?.storeId ?? storeId),
    logo: String(doc?.logo ?? defaultBranding.logo),
    primaryColor: String(doc?.primaryColor ?? defaultBranding.primaryColor),
    buttonColor: String(doc?.buttonColor ?? defaultBranding.buttonColor),
    footer: String(doc?.footer ?? defaultBranding.footer),
    socialLinks: {
      facebook: String(social.facebook ?? defaultBranding.socialLinks.facebook),
      instagram: String(social.instagram ?? defaultBranding.socialLinks.instagram),
      x: String(social.x ?? defaultBranding.socialLinks.x),
      linkedin: String(social.linkedin ?? defaultBranding.socialLinks.linkedin),
      youtube: String(social.youtube ?? defaultBranding.socialLinks.youtube),
    },
    website: String(doc?.website ?? defaultBranding.website),
    supportEmail: String(doc?.supportEmail ?? defaultBranding.supportEmail),
    phone: String(doc?.phone ?? defaultBranding.phone),
    address: String(doc?.address ?? defaultBranding.address),
    createdAt: doc?.createdAt ? new Date(doc.createdAt as string | Date).toISOString() : undefined,
    updatedAt: doc?.updatedAt ? new Date(doc.updatedAt as string | Date).toISOString() : undefined,
  };
}

export async function ensureDefaultEmailBranding(storeId: string, session?: mongoose.ClientSession) {
  await connectDatabase();
  const query = StoreEmailBrandingModel.findOne({ storeId });
  if (session) query.session(session);
  const existing = await query.lean() as Record<string, unknown> | null;
  if (existing) return serializeBranding(existing, storeId);
  const createOptions = session ? { session } : {};
  const created = await StoreEmailBrandingModel.create([{ storeId, ...defaultBranding }], createOptions);
  return serializeBranding(created[0].toObject() as Record<string, unknown>, storeId);
}

export async function getEmailBranding(storeId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const branding = await StoreEmailBrandingModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  return {
    ok: true as const,
    data: { branding: serializeBranding(branding, storeId) },
  };
}

export async function updateEmailBranding(storeId: string, userId: string, payload: unknown) {
  const parsed = updateEmailBrandingSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid branding data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.socialLinks) {
    for (const [key, value] of Object.entries(parsed.data.socialLinks)) {
      update[`socialLinks.${key}`] = value;
    }
    delete update.socialLinks;
  }

  const branding = await StoreEmailBrandingModel.findOneAndUpdate(
    { storeId },
    { $set: update, $setOnInsert: { storeId } },
    { upsert: true, new: true, runValidators: true },
  ).lean() as Record<string, unknown> | null;

  return {
    ok: true as const,
    data: { branding: serializeBranding(branding, storeId) },
  };
}
