import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreContactModel } from "./store-contact.model.js";
import { updateStoreContactSchema } from "./store-contact.validator.js";

const defaultContact = {
  businessName: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  googleMapsEmbedUrl: "",
  latitude: "",
  longitude: "",
  businessHours: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
    telegram: "",
  },
} as const;

export async function ensureDefaultStoreContact(storeId: string) {
  await connectDatabase();
  const existing = await StoreContactModel.findOne({ storeId }).lean();
  if (existing) return existing;
  const created = await StoreContactModel.create({ storeId, ...defaultContact });
  return created.toObject();
}

export async function getStoreContact(storeId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const contact = await StoreContactModel.findOne({ storeId }).lean();
  return { ok: true as const, data: { contact: contact ?? { storeId, ...defaultContact } } };
}

export async function updateStoreContact(storeId: string, userId: string, payload: unknown) {
  const parsed = updateStoreContactSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid contact data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.socialLinks) {
    update.socialLinks = parsed.data.socialLinks;
  }

  const contact = await StoreContactModel.findOneAndUpdate(
    { storeId },
    { $set: update, $setOnInsert: { storeId, ...defaultContact } },
    { upsert: true, new: true },
  ).lean();

  return { ok: true as const, data: { contact } };
}

export async function getPublicStoreContact(storeId: string) {
  await connectDatabase();
  const contact = await StoreContactModel.findOne({ storeId }).lean();
  return { ok: true as const, data: { contact: contact ?? { storeId, ...defaultContact } } };
}
