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

export async function getProducts(storeId: string) {
  await connectDatabase();
  const products = await ProductModel.find({ storeId }).sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all(products.map((p) => attachProductVariantSummary(p as Record<string, unknown>)));
  return { ok: true as const, data: { products: enriched } };
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
  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  return { ok: true as const, data: { product: hydrated } };
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

export async function seedDemoProducts(storeId: string) {
  await connectDatabase();

  const existing = await ProductModel.countDocuments({ storeId });
  if (existing > 0) return;

  const demoProducts = [
    { name: "Classic Cotton T-Shirt", slug: "classic-cotton-tshirt", price: 29.99, comparePrice: 39.99, category: "Clothing", stock: 150, sku: "TEE-001", description: "Premium cotton crew neck t-shirt. Comfortable fit for everyday wear." },
    { name: "Running Sneakers Pro", slug: "running-sneakers-pro", price: 129.99, comparePrice: 159.99, category: "Footwear", stock: 75, sku: "SNK-001", description: "Lightweight running shoes with responsive cushioning and breathable mesh upper." },
    { name: "Chronograph Watch", slug: "chronograph-watch", price: 249.99, comparePrice: 299.99, category: "Accessories", stock: 40, sku: "WCH-001", description: "Elegant chronograph watch with stainless steel band and sapphire crystal glass." },
    { name: "Essential Hoodie", slug: "essential-hoodie", price: 59.99, comparePrice: 79.99, category: "Clothing", stock: 100, sku: "HOD-001", description: "Warm and cozy fleece hoodie with kangaroo pocket and adjustable hood." },
    { name: "Ultrabook Laptop", slug: "ultrabook-laptop", price: 999.99, comparePrice: 1199.99, category: "Electronics", stock: 25, sku: "LPT-001", description: "Powerful ultrabook with 16GB RAM, 512GB SSD, and 15.6\" 4K display." },
    { name: "Wireless Noise-Canceling Headphones", slug: "wireless-headphones", price: 199.99, comparePrice: 249.99, category: "Electronics", stock: 60, sku: "HDP-001", description: "Premium wireless headphones with active noise cancellation and 30hr battery." },
    { name: "Ergonomic Office Chair", slug: "ergonomic-office-chair", price: 449.99, comparePrice: 549.99, category: "Furniture", stock: 20, sku: "CHR-001", description: "Adjustable ergonomic mesh chair with lumbar support and 3D armrests." },
    { name: "Leather Crossbody Bag", slug: "leather-crossbody-bag", price: 89.99, comparePrice: 119.99, category: "Accessories", stock: 55, sku: "BAG-001", description: "Genuine leather crossbody bag with multiple compartments and adjustable strap." },
    { name: "Digital Camera 4K", slug: "digital-camera-4k", price: 699.99, comparePrice: 849.99, category: "Electronics", stock: 15, sku: "CAM-001", description: "Mirrorless digital camera with 4K video, 24MP sensor, and interchangeable lens." },
    { name: "Premium Perfume", slug: "premium-perfume", price: 79.99, comparePrice: 99.99, category: "Beauty", stock: 90, sku: "PRF-001", description: "Long-lasting premium fragrance with notes of bergamot, cedar, and amber." },
    { name: "Denim Jacket", slug: "denim-jacket", price: 89.99, comparePrice: 119.99, category: "Clothing", stock: 45, sku: "DEN-001", description: "Classic denim jacket with button front and chest pockets. Timeless style for any wardrobe." },
    { name: "Leather Boots", slug: "leather-boots", price: 199.99, comparePrice: 259.99, category: "Footwear", stock: 30, sku: "BOO-001", description: "Handcrafted leather boots with durable sole and premium stitching." },
    { name: "Sunglasses Aviator", slug: "sunglasses-aviator", price: 149.99, comparePrice: 189.99, category: "Accessories", stock: 65, sku: "SUN-001", description: "Classic aviator sunglasses with UV400 protection and gold frame." },
    { name: "Cashmere Sweater", slug: "cashmere-sweater", price: 129.99, comparePrice: 169.99, category: "Clothing", stock: 35, sku: "SWE-001", description: "Luxurious cashmere sweater with ribbed cuffs and hem. Ultra-soft and warm." },
    { name: "Smart Speaker", slug: "smart-speaker", price: 79.99, comparePrice: 99.99, category: "Electronics", stock: 80, sku: "SPK-001", description: "WiFi smart speaker with voice assistant and rich 360-degree sound." },
    { name: "Yoga Mat Premium", slug: "yoga-mat-premium", price: 49.99, comparePrice: 64.99, category: "Fitness", stock: 120, sku: "YOG-001", description: "Extra thick non-slip yoga mat with carrying strap. Perfect for home workouts." },
    { name: "Ceramic Coffee Mug Set", slug: "ceramic-coffee-mug-set", price: 34.99, category: "Home", stock: 200, sku: "MUG-001", description: "Set of 4 handcrafted ceramic coffee mugs. Microwave and dishwasher safe." },
    { name: "Backpack Travel Pro", slug: "backpack-travel-pro", price: 69.99, comparePrice: 89.99, category: "Accessories", stock: 70, sku: "BPK-001", description: "Waterproof travel backpack with laptop compartment and USB charging port." },
    { name: "Stainless Steel Water Bottle", slug: "stainless-water-bottle", price: 24.99, comparePrice: 34.99, category: "Home", stock: 250, sku: "BOT-001", description: "Double-wall insulated water bottle. Keeps drinks cold 24hr or hot 12hr." },
    { name: "Wireless Earbuds Pro", slug: "wireless-earbuds-pro", price: 89.99, comparePrice: 129.99, category: "Electronics", stock: 95, sku: "EAR-001", description: "True wireless earbuds with active noise cancellation and 8hr battery life." }
  ];

  const products = demoProducts.map((p, index) => {
    const imageUrl = `https://placehold.co/1200x1200/png?text=${encodeURIComponent(p.name)}`;
    return {
      ...p,
      storeId,
      description: p.description ?? "",
      status: "active" as const,
      featured: index < 4,
      imageUrl,
      thumbnailUrl: imageUrl,
      galleryImageUrls: [imageUrl],
      images: [imageUrl]
    };
  });
  await ProductModel.insertMany(products);
  console.log(`  ✔ Seeded ${products.length} demo products for store ${storeId}`);
}
