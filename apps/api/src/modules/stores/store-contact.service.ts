import mongoose from "mongoose";
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

function serializeStoreContact(doc: Record<string, unknown> | null | undefined, storeId: string) {
  const social = (doc?.socialLinks as Record<string, unknown> | undefined) ?? {};

  return {
    _id: doc?._id ? String(doc._id) : undefined,
    storeId: String(doc?.storeId ?? storeId),
    businessName: String(doc?.businessName ?? defaultContact.businessName),
    email: String(doc?.email ?? defaultContact.email),
    phone: String(doc?.phone ?? defaultContact.phone),
    whatsapp: String(doc?.whatsapp ?? defaultContact.whatsapp),
    address: String(doc?.address ?? defaultContact.address),
    city: String(doc?.city ?? defaultContact.city),
    country: String(doc?.country ?? defaultContact.country),
    postalCode: String(doc?.postalCode ?? defaultContact.postalCode),
    googleMapsEmbedUrl: String(doc?.googleMapsEmbedUrl ?? defaultContact.googleMapsEmbedUrl),
    latitude: String(doc?.latitude ?? defaultContact.latitude),
    longitude: String(doc?.longitude ?? defaultContact.longitude),
    businessHours: String(doc?.businessHours ?? defaultContact.businessHours),
    socialLinks: {
      facebook: String(social.facebook ?? defaultContact.socialLinks.facebook),
      instagram: String(social.instagram ?? defaultContact.socialLinks.instagram),
      x: String(social.x ?? defaultContact.socialLinks.x),
      linkedin: String(social.linkedin ?? defaultContact.socialLinks.linkedin),
      youtube: String(social.youtube ?? defaultContact.socialLinks.youtube),
      telegram: String(social.telegram ?? defaultContact.socialLinks.telegram),
    },
    createdAt: doc?.createdAt ? new Date(doc.createdAt as string | Date).toISOString() : undefined,
    updatedAt: doc?.updatedAt ? new Date(doc.updatedAt as string | Date).toISOString() : undefined,
  };
}

export async function ensureDefaultStoreContact(storeId: string, session?: mongoose.ClientSession) {
  await connectDatabase();
  const query = StoreContactModel.findOne({ storeId });
  if (session) query.session(session);
  const existing: any = await query.lean();
  if (existing) return serializeStoreContact(existing, storeId);
  const createOptions = session ? { session } : {};
  const created = await StoreContactModel.create([{ storeId, ...defaultContact }], createOptions);
  return serializeStoreContact(created[0].toObject() as Record<string, unknown>, storeId);
}

export async function getStoreContact(storeId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const contact: any = await StoreContactModel.findOne({ storeId }).lean();
  return {
    ok: true as const,
    data: { contact: serializeStoreContact(contact, storeId) },
  };
}

export async function updateStoreContact(storeId: string, userId: string, payload: unknown) {
  const parsed = updateStoreContactSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid contact data" };

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

  const contact: any = await StoreContactModel.findOneAndUpdate(
    { storeId },
    { $set: update, $setOnInsert: { storeId } },
    { upsert: true, new: true, runValidators: true },
  ).lean();

  return {
    ok: true as const,
    data: { contact: serializeStoreContact(contact, storeId) },
  };
}

export async function getPublicStoreContact(storeId: string) {
  await connectDatabase();
  const contact: any = await StoreContactModel.findOne({ storeId }).lean();
  return {
    ok: true as const,
    data: { contact: serializeStoreContact(contact, storeId) },
  };
}

