import mongoose from "mongoose";
import {
  parseListQuery,
  paginatedResponse,
  buildTextSearchFilter,
  type ListQueryParams,
} from "../../common/utils/pagination.js";
import { connectDatabase } from "../../common/database/connection.js";
import { ProductModel } from "../../models/product.model.js";
import { StoreModel } from "../../models/store.model.js";
import { createProductSchema, updateProductSchema, createVariantSchema, updateVariantSchema } from "./product.validator.js";
import { checkLimit } from "../features/feature-access.service.js";
import {
  hydrateProduct,
  attachProductVariantSummary,
  deleteProductVariants,
  syncProductVariants,
} from "./variants/variant.service.js";
import {
  removeEntityMediaReferences,
  resolveMediaFile,
  resolveMediaFiles,
  syncEntityMediaReferences,
} from "../media/media-reference.service.js";

type ResolvedMediaFile = {
  publicUrl: string;
  thumbnailUrl?: string;
};

function normalizeProductImages(payload: {
  imageUrl?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  images?: string[];
}) {
  const galleryImageUrls = payload.galleryImageUrls ?? payload.images ?? [];
  const imageUrl = payload.imageUrl ?? galleryImageUrls[0] ?? "";
  const thumbnailUrl = payload.thumbnailUrl ?? imageUrl;
  const images = [imageUrl, thumbnailUrl, ...galleryImageUrls].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);

  return { imageUrl, thumbnailUrl, galleryImageUrls, images };
}

async function resolveProductMediaPayload(
  storeId: string,
  payload: {
    featuredImageId?: string | null;
    galleryImageIds?: string[];
    imageUrl?: string;
    thumbnailUrl?: string;
    galleryImageUrls?: string[];
    images?: string[];
  }
) {
  let imageUrl = payload.imageUrl ?? "";
  let thumbnailUrl = payload.thumbnailUrl ?? "";
  let galleryImageUrls = payload.galleryImageUrls ?? payload.images ?? [];
  const galleryImageIds = payload.galleryImageIds ?? [];

  if (payload.featuredImageId) {
    const featured = await resolveMediaFile(storeId, payload.featuredImageId) as ResolvedMediaFile | null;
    if (featured) {
      imageUrl = featured.publicUrl;
      thumbnailUrl = featured.thumbnailUrl ?? featured.publicUrl;
    }
  }

  if (galleryImageIds.length > 0) {
    const map = await resolveMediaFiles(storeId, galleryImageIds);
    galleryImageUrls = galleryImageIds
      .map((id) => map.get(id)?.publicUrl ?? "")
      .filter(Boolean);
  }

  return {
    ...normalizeProductImages({ imageUrl, thumbnailUrl, galleryImageUrls }),
    featuredImageId: payload.featuredImageId ?? null,
    galleryImageIds,
  };
}

async function syncProductMediaReferences(
  storeId: string,
  productId: string,
  product: {
    featuredImageId?: string | null;
    galleryImageIds?: string[];
  }
) {
  const refs = [
    { fieldPath: "featuredImage", mediaFileId: product.featuredImageId, label: "Featured Image" },
    ...(product.galleryImageIds ?? []).map((id, index) => ({
      fieldPath: `galleryImages.${index}`,
      mediaFileId: id,
      label: `Gallery Image ${index + 1}`,
    })),
  ];
  await syncEntityMediaReferences(storeId, "product", productId, refs);
}

function buildProductListFilter(storeId: string, query: ListQueryParams) {
  const clauses: Record<string, unknown>[] = [{ storeId }];

  const textFilter = buildTextSearchFilter(query.search, ["name", "slug", "sku", "brand", "category", "description"]);
  if (textFilter?.$or) clauses.push({ $or: textFilter.$or });

  if (query.status) clauses.push({ status: query.status });
  if (query.category) {
    clauses.push({
      $or: [
        { category: query.category },
        ...(mongoose.Types.ObjectId.isValid(query.category)
          ? [{ categoryIds: new mongoose.Types.ObjectId(query.category) }]
          : []),
      ],
    });
  }
  if (query.brand) clauses.push({ brand: query.brand });
  if (query.featured === "true") clauses.push({ featured: true });
  if (query.featured === "false") clauses.push({ featured: false });
  if (query.stockStatus === "in") clauses.push({ stock: { $gt: 0 } });
  if (query.stockStatus === "out") clauses.push({ stock: { $lte: 0 } });
  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    clauses.push({
      price: {
        ...(query.priceMin !== undefined ? { $gte: query.priceMin } : {}),
        ...(query.priceMax !== undefined ? { $lte: query.priceMax } : {}),
      },
    });
  }

  return clauses.length === 1 ? clauses[0] : { $and: clauses };
}

export async function getProducts(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery(query);
  const filter = buildProductListFilter(storeId, params);

  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .sort(params.sort ?? { createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  const enriched = await Promise.all(products.map((p) => attachProductVariantSummary(p as Record<string, unknown>)));
  const paginated = paginatedResponse(enriched, total, params);

  return {
    ok: true as const,
    data: {
      products: paginated.data,
      pagination: paginated.pagination,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: paginated.pagination.totalPages,
    },
  };
}

export async function getPublicProducts(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery({
    status: "active",
    sortBy: "createdAt",
    sortOrder: "desc",
    ...query,
  });
  const filter = buildProductListFilter(storeId, {
    ...params,
    status: "active",
  });

  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .sort(params.sort ?? { createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  const enriched = await Promise.all(products.map((p) => attachProductVariantSummary(p as Record<string, unknown>)));
  const paginated = paginatedResponse(enriched, total, params);

  return {
    ok: true as const,
    data: {
      products: paginated.data,
      pagination: paginated.pagination,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: paginated.pagination.totalPages,
    },
  };
}

export async function getProduct(productId: string) {
  await connectDatabase();
  const product = await ProductModel.findById(productId).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  return { ok: true as const, data: { product: hydrated } };
}

export async function getProductBySlug(storeId: string, slug: string) {
  await connectDatabase();
  const product = await ProductModel.findOne({ storeId, slug, status: "active" }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  return { ok: true as const, data: { product: hydrated } };
}

export async function createProduct(storeId: string, payload: unknown) {
  const parsed = createProductSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid product data" };

  await connectDatabase();

  const store = await StoreModel.findById(storeId).lean() as { planId?: string; allowNewOrders?: boolean } | null;
  if (store && store.allowNewOrders === false) {
    return { ok: false as const, message: "Store cannot accept new products while subscription is expired" };
  }

  const limitCheck = await checkLimit(storeId, "products");
  if (!limitCheck.allowed) {
    return { ok: false as const, message: limitCheck.message ?? "Product limit reached" };
  }

  const existing = await ProductModel.findOne({ storeId, slug: parsed.data.slug });
  if (existing) return { ok: false as const, message: "Product slug already exists in this store" };

  const { options, variants, ...rest } = parsed.data;
  const mediaFields = await resolveProductMediaPayload(storeId, rest);

  const product = await ProductModel.create({
    storeId,
    ...rest,
    ...mediaFields,
  });

  if (options !== undefined || variants !== undefined) {
    const syncResult = await syncProductVariants(String(product._id), storeId, {
      options: options ?? [],
      variants: variants ?? [],
      productType: rest.productType,
    });
    if (!syncResult.ok) {
      await deleteProductVariants(String(product._id));
      await ProductModel.deleteOne({ _id: product._id, storeId });
      return syncResult;
    }
  }

  const hydrated = await hydrateProduct(product.toObject() as Record<string, unknown>);
  await syncProductMediaReferences(storeId, String(product._id), mediaFields);
  return { ok: true as const, data: { product: hydrated } };
}

export async function updateProduct(productId: string, storeId: string, payload: unknown) {
  const parsed = updateProductSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid product data" };

  await connectDatabase();

  const { options, variants, ...rest } = parsed.data;
  if (options !== undefined || variants !== undefined) {
    const syncResult = await syncProductVariants(productId, storeId, {
      options: options ?? [],
      variants: variants ?? [],
      productType: rest.productType,
    });
    if (!syncResult.ok) return syncResult;
  }

  const previous = updatePayloadWouldTouchPriceOrCost(rest as Record<string, unknown>)
    ? ((await ProductModel.findOne({ _id: productId, storeId })
        .select("price comparePrice")
        .lean()) as { price?: number; comparePrice?: number } | null)
    : null;

  const updatePayload = Object.keys(rest).length
    ? { ...rest, ...(await resolveProductMediaPayload(storeId, rest)) }
    : null;
  let product;
  if (updatePayload) {
    product = await ProductModel.findOneAndUpdate(
      { _id: productId, storeId },
      { $set: updatePayload },
      { new: true }
    ).lean();
  } else {
    product = await ProductModel.findOne({ _id: productId, storeId }).lean();
  }

  if (!product) return { ok: false as const, message: "Product not found" };
  if (updatePayload) {
    await syncProductMediaReferences(storeId, productId, updatePayload);
  }

  if (previous && updatePayload) {
    try {
      const {
        recordPriceChange,
        recordCostChange,
        appendProductTimeline,
      } = await import("../inventory/inventory-erp.service.js");

      const next = product as { price?: number; comparePrice?: number; costPrice?: number };
      const prevPrice = previous.price ?? 0;
      const nextPrice = next.price ?? prevPrice;
      if (rest.price !== undefined && prevPrice !== nextPrice) {
        await recordPriceChange(storeId, {
          productId,
          field: "sellingPrice",
          previousPrice: prevPrice,
          newPrice: nextPrice,
          reason: "product_update",
        });
        await appendProductTimeline(storeId, {
          productId,
          eventType: "price_changed",
          title: "Selling price updated",
          detail: `${prevPrice} → ${nextPrice}`,
          actorName: "system",
          metadata: { field: "sellingPrice", previousPrice: prevPrice, newPrice: nextPrice },
        });
      }

      const prevCompare = previous.comparePrice ?? 0;
      const nextCompare = next.comparePrice ?? prevCompare;
      if (rest.comparePrice !== undefined && prevCompare !== nextCompare) {
        await recordPriceChange(storeId, {
          productId,
          field: "comparePrice",
          previousPrice: prevCompare,
          newPrice: nextCompare,
          reason: "product_update",
        });
        await appendProductTimeline(storeId, {
          productId,
          eventType: "price_changed",
          title: "Compare price updated",
          detail: `${prevCompare} → ${nextCompare}`,
          actorName: "system",
          metadata: { field: "comparePrice", previousPrice: prevCompare, newPrice: nextCompare },
        });
      }

      const costPayload = (rest as { costPrice?: number }).costPrice;
      if (costPayload !== undefined) {
        const prevCost = (previous as { costPrice?: number }).costPrice ?? 0;
        if (prevCost !== costPayload) {
          await recordCostChange(storeId, {
            productId,
            previousCost: prevCost,
            newCost: costPayload,
            averageCost: costPayload,
            reason: "product_update",
          });
          await appendProductTimeline(storeId, {
            productId,
            eventType: "cost_changed",
            title: "Cost updated",
            detail: `${prevCost} → ${costPayload}`,
            actorName: "system",
            metadata: { previousCost: prevCost, newCost: costPayload },
          });
        }
      }
    } catch (err) {
      console.error("[products] Failed to record price/cost history", err);
    }
  }

  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  return { ok: true as const, data: { product: hydrated } };
}

function updatePayloadWouldTouchPriceOrCost(rest: Record<string, unknown>) {
  return rest.price !== undefined || rest.comparePrice !== undefined || rest.costPrice !== undefined;
}

export async function deleteProduct(productId: string, storeId: string) {
  await connectDatabase();
  const product = await ProductModel.findOneAndDelete({ _id: productId, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  await removeEntityMediaReferences(storeId, "product", productId);
  await deleteProductVariants(productId);
  return { ok: true as const, message: "Product deleted" };
}

export async function createVariant(productId: string, storeId: string, payload: unknown) {
  const parsed = createVariantSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid variant data" };

  await connectDatabase();
  const product = await ProductModel.findOne({ _id: productId, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  const hydratedOptions = Array.isArray(hydrated.options) ? hydrated.options.map((option) => ({
    _id: typeof option === "object" && option && "_id" in option ? String(option._id ?? "") : undefined,
    name: String((option as { name?: unknown }).name ?? ""),
    values: Array.isArray((option as { values?: unknown[] }).values)
      ? (option as { values?: unknown[] }).values!.map((value) => String(value))
      : [],
  })) : [];
  const hydratedVariants = Array.isArray(hydrated.variants) ? hydrated.variants.map((variant) => ({
    ...(variant as Record<string, unknown>),
  })) : [];
  const syncResult = await syncProductVariants(productId, storeId, {
    options: hydratedOptions,
    variants: [...hydratedVariants, parsed.data],
    productType: "variable",
  });
  return syncResult;
}

export async function updateVariant(productId: string, variantId: string, storeId: string, payload: unknown) {
  const parsed = updateVariantSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid variant data" };

  await connectDatabase();
  const product = await ProductModel.findOne({ _id: productId, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  const hydratedOptions = Array.isArray(hydrated.options) ? hydrated.options.map((option) => ({
    _id: typeof option === "object" && option && "_id" in option ? String(option._id ?? "") : undefined,
    name: String((option as { name?: unknown }).name ?? ""),
    values: Array.isArray((option as { values?: unknown[] }).values)
      ? (option as { values?: unknown[] }).values!.map((value) => String(value))
      : [],
  })) : [];
  const variants = ((hydrated.variants as Array<Record<string, unknown>>) ?? []).map((variant) =>
    String(variant._id) === variantId ? { ...variant, ...parsed.data } : variant
  );
  const exists = variants.some((variant) => String(variant._id) === variantId);
  if (!exists) return { ok: false as const, message: "Variant not found" };
  return syncProductVariants(productId, storeId, {
    options: hydratedOptions,
    variants,
    productType: "variable",
  });
}

export async function deleteVariant(productId: string, variantId: string, storeId: string) {
  await connectDatabase();
  const product = await ProductModel.findOne({ _id: productId, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  const hydratedOptions = Array.isArray(hydrated.options) ? hydrated.options.map((option) => ({
    _id: typeof option === "object" && option && "_id" in option ? String(option._id ?? "") : undefined,
    name: String((option as { name?: unknown }).name ?? ""),
    values: Array.isArray((option as { values?: unknown[] }).values)
      ? (option as { values?: unknown[] }).values!.map((value) => String(value))
      : [],
  })) : [];
  const variants = ((hydrated.variants as Array<Record<string, unknown>>) ?? []).filter(
    (variant) => String(variant._id) !== variantId
  );
  if (variants.length === ((hydrated.variants as unknown[]) ?? []).length) {
    return { ok: false as const, message: "Variant not found" };
  }
  return syncProductVariants(productId, storeId, {
    options: hydratedOptions,
    variants,
    productType: variants.length > 0 ? "variable" : "simple",
  });
}

export async function duplicateProduct(productId: string, storeId: string) {
  await connectDatabase();
  const limitCheck = await checkLimit("products", storeId);
  if (!limitCheck.allowed) return { ok: false as const, message: "Product limit reached for your plan" };
  const original: any = await ProductModel.findOne({ _id: productId, storeId }).lean();
  if (!original) return { ok: false as const, message: "Product not found" };
  const hydratedOriginal = await hydrateProduct(original as Record<string, unknown>);

  const dup = await ProductModel.create({
    storeId,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now()}`,
    description: original.description,
    price: original.price,
    comparePrice: original.comparePrice,
    category: original.category,
    categoryIds: original.categoryIds ?? [],
    stock: original.stock,
    status: "inactive",
    sku: original.sku ? `${original.sku}-COPY` : "",
    imageUrl: original.imageUrl ?? original.images?.[0] ?? "",
    thumbnailUrl: original.thumbnailUrl ?? original.imageUrl ?? original.images?.[0] ?? "",
    galleryImageUrls: original.galleryImageUrls ?? original.images ?? [],
    images: original.images,
    featured: false,
    productType: hydratedOriginal.productType ?? original.productType ?? "simple",
    options: [],
    variants: [],
  });

  if ((hydratedOriginal.options as unknown[])?.length || (hydratedOriginal.variants as unknown[])?.length) {
    await syncProductVariants(String(dup._id), storeId, {
      options: ((hydratedOriginal.options as Array<{ _id?: string; name: string; values: string[] }>) ?? []).map((option) => ({
        name: option.name,
        values: option.values ?? [],
      })),
      variants: ((hydratedOriginal.variants as Array<{
        optionValues?: Record<string, string>;
        price?: number;
        comparePrice?: number;
        wholesalePrice?: number;
        costPrice?: number;
        stock?: number;
        sku?: string;
        barcode?: string;
        imageUrl?: string;
        galleryUrls?: string[];
        enabled?: boolean;
        status?: string;
        isDefault?: boolean;
        isFeatured?: boolean;
        isBestSeller?: boolean;
        allowPreOrder?: boolean;
        allowBackorder?: boolean;
        isComingSoon?: boolean;
        weight?: number;
        weightUnit?: string;
      }>) ?? []).map((v) => ({
        optionValues: v.optionValues ?? {},
        price: v.price,
        comparePrice: v.comparePrice,
        wholesalePrice: v.wholesalePrice,
        costPrice: v.costPrice,
        stock: v.stock ?? 0,
        sku: v.sku ? `${v.sku}-COPY` : "",
        barcode: v.barcode ?? "",
        imageUrl: v.imageUrl ?? "",
        galleryUrls: v.galleryUrls ?? [],
        enabled: v.enabled !== false,
        status: v.status as "active" | "draft" | "out_of_stock" | "archived" | "hidden" | undefined,
        isDefault: v.isDefault,
        isFeatured: v.isFeatured,
        isBestSeller: v.isBestSeller,
        allowPreOrder: v.allowPreOrder,
        allowBackorder: v.allowBackorder,
        isComingSoon: v.isComingSoon,
        weight: v.weight,
        weightUnit: v.weightUnit,
      })),
      productType: "variable",
    });
  }

  const hydrated = await hydrateProduct(dup.toObject() as Record<string, unknown>);
  return { ok: true as const, data: { product: hydrated } };
}


