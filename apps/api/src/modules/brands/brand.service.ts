import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { BrandModel } from "./brand.model.js";
import { ProductModel } from "../../models/product.model.js";
import { StoreModel } from "../../models/store.model.js";
import { parseListQuery, paginatedResponse, buildTextSearchFilter } from "../../common/utils/pagination.js";
import { checkLimit } from "../features/feature-access.service.js";
import {
  removeEntityMediaReferences,
  resolveMediaFile,
  syncEntityMediaReferences,
} from "../media/media-reference.service.js";

type BrandMediaPayload = {
  logoUrl?: string;
  logoId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
};

type ResolvedMediaFile = {
  publicUrl: string;
};

async function hydrateBrandMedia(storeId: string, payload: BrandMediaPayload) {
  const result = { ...payload };

  if (payload.logoId !== undefined) {
    const file = payload.logoId ? await resolveMediaFile(storeId, payload.logoId) as ResolvedMediaFile | null : null;
    result.logoUrl = file?.publicUrl ?? payload.logoUrl ?? "";
  }
  if (payload.bannerId !== undefined) {
    const file = payload.bannerId ? await resolveMediaFile(storeId, payload.bannerId) as ResolvedMediaFile | null : null;
    result.bannerUrl = file?.publicUrl ?? payload.bannerUrl ?? "";
  }

  return result;
}

async function syncBrandMediaReferences(
  storeId: string,
  brandId: string,
  brand: BrandMediaPayload
) {
  await syncEntityMediaReferences(storeId, "brand", brandId, [
    { fieldPath: "logo", mediaFileId: brand.logoId, label: "Brand Logo" },
    { fieldPath: "banner", mediaFileId: brand.bannerId, label: "Brand Banner" },
  ]);
}

export async function getBrands(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery(query);
  const clauses: Record<string, unknown>[] = [{ storeId }];
  const textFilter = buildTextSearchFilter(params.search, ["name", "slug", "description"]);
  if (textFilter?.$or) clauses.push({ $or: textFilter.$or });
  if (params.status === "active") clauses.push({ active: true });
  if (params.status === "inactive") clauses.push({ active: false });

  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };
  const sort = params.sort ?? { sortOrder: 1, name: 1 };

  const [brands, total, productCounts] = await Promise.all([
    BrandModel.find(filter).sort(sort).skip(params.skip).limit(params.limit).lean(),
    BrandModel.countDocuments(filter),
    ProductModel.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      {
        $group: {
          _id: "$brandId",
          count: { $sum: 1 },
          names: { $addToSet: "$brand" },
        },
      },
    ]),
  ]);

  const countByBrandId = new Map<string, number>();
  const countByBrandName = new Map<string, number>();

  for (const item of productCounts) {
    if (item._id) {
      countByBrandId.set(String(item._id), item.count);
    }
    if (Array.isArray(item.names)) {
      for (const name of item.names) {
        if (name) {
          countByBrandName.set(String(name).toLowerCase(), item.count);
        }
      }
    }
  }

  const enriched = brands.map((b) => ({
    ...b,
    productCount: countByBrandId.get(String(b._id)) ?? countByBrandName.get(b.name.toLowerCase()) ?? 0,
  }));

  const paginated = paginatedResponse(enriched, total, params);
  return {
    ok: true as const,
    data: {
      brands: paginated.data,
      pagination: paginated.pagination,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: paginated.pagination.totalPages,
    },
  };
}

export async function getBrand(brandId: string, storeId: string) {
  await connectDatabase();
  const brand = (await BrandModel.findOne({ _id: brandId, storeId }).lean()) as Record<string, any> | null;
  if (!brand) return { ok: false as const, message: "Brand not found" };

  const productCount = await ProductModel.countDocuments({
    storeId,
    $or: [{ brandId }, { brand: brand.name }],
  });

  return { ok: true as const, data: { brand: { ...brand, productCount } } };
}

export async function getBrandBySlug(storeId: string, slug: string) {
  await connectDatabase();
  const brand = (await BrandModel.findOne({ storeId, slug }).lean()) as Record<string, any> | null;
  if (!brand) return { ok: false as const, message: "Brand not found" };

  const productCount = await ProductModel.countDocuments({
    storeId,
    $or: [{ brandId: brand._id }, { brand: brand.name }],
  });

  return { ok: true as const, data: { brand: { ...brand, productCount } } };
}

export async function createBrand(storeId: string, userId: string, payload: {
  name: string; slug: string; logoUrl?: string; logoId?: string | null;
  bannerUrl?: string; bannerId?: string | null; description?: string;
  website?: string; active?: boolean; featured?: boolean;
  metaTitle?: string; metaDescription?: string;
}) {
  await connectDatabase();

  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const existing = await BrandModel.findOne({ storeId, slug: payload.slug });
  if (existing) return { ok: false as const, message: "Brand slug already exists" };

  const mediaPayload = await hydrateBrandMedia(storeId, payload);
  const count = await BrandModel.countDocuments({ storeId });
  const brand = await BrandModel.create({
    storeId,
    ...payload,
    ...mediaPayload,
    sortOrder: count,
  });

  await syncBrandMediaReferences(storeId, String(brand._id), brand.toObject() as BrandMediaPayload);

  return { ok: true as const, data: { brand: brand.toObject() } };
}

export async function updateBrand(brandId: string, storeId: string, userId: string, payload: Partial<{
  name: string; slug: string; logoUrl: string; logoId: string | null;
  bannerUrl: string; bannerId: string | null; description: string;
  website: string; active: boolean; featured: boolean; sortOrder: number;
  metaTitle: string; metaDescription: string;
}>) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  if (payload.slug) {
    const dup = await BrandModel.findOne({ storeId, slug: payload.slug, _id: { $ne: brandId } });
    if (dup) return { ok: false as const, message: "Brand slug already exists" };
  }

  const mediaPayload =
    payload.logoId !== undefined || payload.bannerId !== undefined
      ? await hydrateBrandMedia(storeId, payload)
      : payload;

  const brand = await BrandModel.findOneAndUpdate(
    { _id: brandId, storeId },
    { $set: mediaPayload },
    { new: true }
  ).lean();

  if (!brand) return { ok: false as const, message: "Brand not found" };
  await syncBrandMediaReferences(storeId, brandId, brand as BrandMediaPayload);

  // If brand name changed, sync product brand names
  if (payload.name) {
    await ProductModel.updateMany(
      { storeId, brandId },
      { $set: { brand: payload.name } }
    );
  }

  return { ok: true as const, data: { brand } };
}

export async function deleteBrand(brandId: string, storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const brand = await BrandModel.findOneAndDelete({ _id: brandId, storeId }).lean();
  if (!brand) return { ok: false as const, message: "Brand not found" };

  await removeEntityMediaReferences(storeId, "brand", brandId);

  // Clear brand relationship on linked products
  await ProductModel.updateMany(
    { storeId, brandId },
    { $set: { brandId: null, brand: "" } }
  );

  return { ok: true as const, message: "Brand deleted" };
}

export async function reorderBrands(storeId: string, userId: string, orderedIds: string[]) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  for (let i = 0; i < orderedIds.length; i++) {
    await BrandModel.updateOne({ _id: orderedIds[i], storeId }, { $set: { sortOrder: i } });
  }
  return { ok: true as const, message: "Brands reordered" };
}
