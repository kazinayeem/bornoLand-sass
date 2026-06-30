import { connectDatabase } from "../../common/database/connection.js";
import { CollectionModel } from "./collection.model.js";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional().default(""),
  imageUrl: z.string().optional().default(""),
  productIds: z.array(z.string()).optional().default([]),
  sortOrder: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

export async function listCollections(storeId: string) {
  await connectDatabase();
  const collections = await CollectionModel.find({ storeId }).sort({ sortOrder: 1 }).lean();
  return { ok: true as const, data: { collections } };
}

export async function createCollection(storeId: string, payload: unknown) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid collection data" };
  await connectDatabase();
  const existing = await CollectionModel.findOne({ storeId, slug: parsed.data.slug });
  if (existing) return { ok: false as const, message: "Collection slug already exists" };
  const collection = await CollectionModel.create({ storeId, ...parsed.data });
  return { ok: true as const, data: { collection: collection.toObject() } };
}

export async function updateCollection(storeId: string, id: string, payload: unknown) {
  const parsed = schema.partial().safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid collection data" };
  await connectDatabase();
  const collection = await CollectionModel.findOneAndUpdate({ _id: id, storeId }, { $set: parsed.data }, { new: true }).lean();
  if (!collection) return { ok: false as const, message: "Collection not found" };
  return { ok: true as const, data: { collection } };
}

export async function deleteCollection(storeId: string, id: string) {
  await connectDatabase();
  const collection = await CollectionModel.findOneAndDelete({ _id: id, storeId }).lean();
  if (!collection) return { ok: false as const, message: "Collection not found" };
  return { ok: true as const, message: "Collection deleted" };
}
