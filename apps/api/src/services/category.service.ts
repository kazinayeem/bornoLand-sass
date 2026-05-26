import { connectDatabase } from "../config/database.js";
import { CategoryModel } from "../models/category.model.js";
import { ProductModel } from "../models/product.model.js";
import { StoreModel } from "../models/store.model.js";

export async function getCategories(storeId: string) {
  await connectDatabase();
  const categories = await CategoryModel.find({ storeId }).sort({ sortOrder: 1, name: 1 }).lean();
  return { ok: true as const, data: { categories } };
}

export async function getCategory(categoryId: string, storeId: string) {
  await connectDatabase();
  const category = await CategoryModel.findOne({ _id: categoryId, storeId }).lean();
  if (!category) return { ok: false as const, message: "Category not found" };
  return { ok: true as const, data: { category } };
}

export async function getCategoryBySlug(storeId: string, slug: string) {
  await connectDatabase();
  const category = await CategoryModel.findOne({ storeId, slug }).lean();
  if (!category) return { ok: false as const, message: "Category not found" };
  return { ok: true as const, data: { category } };
}

export async function createCategory(storeId: string, userId: string, payload: {
  name: string; slug: string; imageUrl?: string; description?: string;
  parentId?: string | null; active?: boolean; featured?: boolean;
}) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const existing = await CategoryModel.findOne({ storeId, slug: payload.slug });
  if (existing) return { ok: false as const, message: "Category slug already exists" };

  const count = await CategoryModel.countDocuments({ storeId });
  const category = await CategoryModel.create({
    storeId,
    ...payload,
    parentId: payload.parentId || null,
    sortOrder: count,
  });

  return { ok: true as const, data: { category: category.toObject() } };
}

export async function updateCategory(categoryId: string, storeId: string, userId: string, payload: Partial<{
  name: string; slug: string; imageUrl: string; description: string;
  parentId: string | null; active: boolean; featured: boolean; sortOrder: number;
}>) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  if (payload.slug) {
    const dup = await CategoryModel.findOne({ storeId, slug: payload.slug, _id: { $ne: categoryId } });
    if (dup) return { ok: false as const, message: "Category slug already exists" };
  }

  const category = await CategoryModel.findOneAndUpdate(
    { _id: categoryId, storeId },
    { $set: payload },
    { new: true }
  ).lean();

  if (!category) return { ok: false as const, message: "Category not found" };
  return { ok: true as const, data: { category } };
}

export async function deleteCategory(categoryId: string, storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const category = await CategoryModel.findOneAndDelete({ _id: categoryId, storeId }).lean();
  if (!category) return { ok: false as const, message: "Category not found" };

  await ProductModel.updateMany(
    { storeId, categoryIds: categoryId },
    { $pull: { categoryIds: categoryId } }
  );

  await CategoryModel.updateMany(
    { storeId, parentId: categoryId },
    { $set: { parentId: null } }
  );

  return { ok: true as const, message: "Category deleted" };
}

export async function reorderCategories(storeId: string, userId: string, orderedIds: string[]) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  for (let i = 0; i < orderedIds.length; i++) {
    await CategoryModel.updateOne({ _id: orderedIds[i], storeId }, { $set: { sortOrder: i } });
  }
  return { ok: true as const, message: "Categories reordered" };
}
