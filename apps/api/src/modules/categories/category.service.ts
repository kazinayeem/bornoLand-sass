import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { CategoryModel } from "../../models/category.model.js";
import { ProductModel } from "../../models/product.model.js";

import { StoreModel } from "../../models/store.model.js";
import { parseListQuery, paginatedResponse, buildTextSearchFilter } from "../../common/utils/pagination.js";
import { checkLimit } from "../features/feature-access.service.js";
import {
  removeEntityMediaReferences,
  resolveMediaFile,
  syncEntityMediaReferences,
} from "../media/media-reference.service.js";

type CategoryMediaPayload = {
  imageUrl?: string;
  imageId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
  iconUrl?: string;
  iconId?: string | null;
};

type ResolvedMediaFile = {
  publicUrl: string;
};

async function hydrateCategoryMedia(storeId: string, payload: CategoryMediaPayload) {
  const result = { ...payload };

  if (payload.imageId !== undefined) {
    const file = payload.imageId ? await resolveMediaFile(storeId, payload.imageId) as ResolvedMediaFile | null : null;
    result.imageUrl = file?.publicUrl ?? payload.imageUrl ?? "";
  }
  if (payload.bannerId !== undefined) {
    const file = payload.bannerId ? await resolveMediaFile(storeId, payload.bannerId) as ResolvedMediaFile | null : null;
    result.bannerUrl = file?.publicUrl ?? payload.bannerUrl ?? "";
  }
  if (payload.iconId !== undefined) {
    const file = payload.iconId ? await resolveMediaFile(storeId, payload.iconId) as ResolvedMediaFile | null : null;
    result.iconUrl = file?.publicUrl ?? payload.iconUrl ?? "";
  }

  return result;
}

async function syncCategoryMediaReferences(
  storeId: string,
  categoryId: string,
  category: CategoryMediaPayload
) {
  await syncEntityMediaReferences(storeId, "category", categoryId, [
    { fieldPath: "image", mediaFileId: category.imageId, label: "Category Image" },
    { fieldPath: "banner", mediaFileId: category.bannerId, label: "Category Banner" },
    { fieldPath: "icon", mediaFileId: category.iconId, label: "Category Icon" },
  ]);
}

export async function getCategories(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery(query);
  const clauses: Record<string, unknown>[] = [{ storeId }];
  const textFilter = buildTextSearchFilter(params.search, ["name", "slug", "description"]);
  if (textFilter?.$or) clauses.push({ $or: textFilter.$or });
  if (params.status === "active") clauses.push({ active: true });
  if (params.status === "inactive") clauses.push({ active: false });
  if (query.parentId === "null" || query.parentId === "root") {
    clauses.push({ parentId: null });
  } else if (query.parentId && query.parentId !== "all") {
    clauses.push({ parentId: query.parentId });
  }
  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };


  const sort = params.sort ?? { sortOrder: 1, name: 1 };
  const [categories, total, productCounts, subcategoryCounts] = await Promise.all([
    CategoryModel.find(filter).sort(sort).skip(params.skip).limit(params.limit).lean(),
    CategoryModel.countDocuments(filter),
    ProductModel.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      { $unwind: "$categoryIds" },
      { $group: { _id: "$categoryIds", count: { $sum: 1 } } },
    ]),
    CategoryModel.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId), parentId: { $ne: null } } },
      { $group: { _id: "$parentId", count: { $sum: 1 } } },
    ]),
  ]);

  const productCountMap = new Map<string, number>();
  for (const item of productCounts) {
    if (item._id) productCountMap.set(String(item._id), item.count);
  }

  const subcategoryCountMap = new Map<string, number>();
  for (const item of subcategoryCounts) {
    if (item._id) subcategoryCountMap.set(String(item._id), item.count);
  }

  const enriched = categories.map((c) => ({
    ...c,
    productCount: productCountMap.get(String(c._id)) ?? 0,
    subcategoryCount: subcategoryCountMap.get(String(c._id)) ?? 0,
  }));

  const paginated = paginatedResponse(enriched, total, params);
  return {
    ok: true as const,
    data: {
      categories: paginated.data,
      pagination: paginated.pagination,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: paginated.pagination.totalPages,
    },
  };
}

/** Attach product/subcategory counts to category rows (storefront + tenant resolver). */
export async function enrichCategoriesWithCounts<T extends Record<string, unknown>>(
  storeId: string,
  categories: T[],
): Promise<Array<T & { productCount: number; subcategoryCount: number }>> {
  if (categories.length === 0) return [];

  await connectDatabase();
  const storeObjectId = new mongoose.Types.ObjectId(storeId);

  const [productCounts, subcategoryCounts] = await Promise.all([
    ProductModel.aggregate([
      { $match: { storeId: storeObjectId } },
      { $unwind: "$categoryIds" },
      { $group: { _id: "$categoryIds", count: { $sum: 1 } } },
    ]),
    CategoryModel.aggregate([
      { $match: { storeId: storeObjectId, parentId: { $ne: null } } },
      { $group: { _id: "$parentId", count: { $sum: 1 } } },
    ]),
  ]);

  const productCountMap = new Map<string, number>();
  for (const item of productCounts) {
    if (item._id) productCountMap.set(String(item._id), item.count);
  }

  const subcategoryCountMap = new Map<string, number>();
  for (const item of subcategoryCounts) {
    if (item._id) subcategoryCountMap.set(String(item._id), item.count);
  }

  return categories.map((c) => ({
    ...c,
    productCount: productCountMap.get(String(c._id)) ?? 0,
    subcategoryCount: subcategoryCountMap.get(String(c._id)) ?? 0,
  }));
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
  name: string; slug: string; imageUrl?: string; imageId?: string | null;
  bannerUrl?: string; bannerId?: string | null; iconUrl?: string; iconId?: string | null;
  description?: string; parentId?: string | null; active?: boolean; featured?: boolean;
  metaTitle?: string; metaDescription?: string;
}) {
  await connectDatabase();

  const limitResult = await checkLimit(storeId, "categories");
  if (!limitResult.allowed) {
    return { ok: false as const, message: limitResult.message ?? "Category limit reached" };
  }

  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const existing = await CategoryModel.findOne({ storeId, slug: payload.slug });
  if (existing) return { ok: false as const, message: "Category slug already exists" };

  const mediaPayload = await hydrateCategoryMedia(storeId, payload);
  const count = await CategoryModel.countDocuments({ storeId });
  const category = await CategoryModel.create({
    storeId,
    ...payload,
    ...mediaPayload,
    parentId: payload.parentId || null,
    sortOrder: count,
  });

  await syncCategoryMediaReferences(storeId, String(category._id), category.toObject() as CategoryMediaPayload);

  return { ok: true as const, data: { category: category.toObject() } };
}

export async function updateCategory(categoryId: string, storeId: string, userId: string, payload: Partial<{
  name: string; slug: string; imageUrl: string; imageId: string | null;
  bannerUrl: string; bannerId: string | null; iconUrl: string; iconId: string | null;
  description: string; parentId: string | null; active: boolean; featured: boolean; sortOrder: number;
  metaTitle: string; metaDescription: string;
}>) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  if (payload.slug) {
    const dup = await CategoryModel.findOne({ storeId, slug: payload.slug, _id: { $ne: categoryId } });
    if (dup) return { ok: false as const, message: "Category slug already exists" };
  }

  const mediaPayload =
    payload.imageId !== undefined || payload.bannerId !== undefined || payload.iconId !== undefined
      ? await hydrateCategoryMedia(storeId, payload)
      : payload;

  const category = await CategoryModel.findOneAndUpdate(
    { _id: categoryId, storeId },
    { $set: mediaPayload },
    { new: true }
  ).lean();

  if (!category) return { ok: false as const, message: "Category not found" };
  await syncCategoryMediaReferences(storeId, categoryId, category as CategoryMediaPayload);
  return { ok: true as const, data: { category } };
}

export async function deleteCategory(categoryId: string, storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const category = await CategoryModel.findOneAndDelete({ _id: categoryId, storeId }).lean();
  if (!category) return { ok: false as const, message: "Category not found" };

  await removeEntityMediaReferences(storeId, "category", categoryId);

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
