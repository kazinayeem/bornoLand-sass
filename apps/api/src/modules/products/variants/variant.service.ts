import { connectDatabase } from "../../../common/database/connection.js";
import { ProductModel } from "../product.model.js";
import { ProductOptionModel } from "./product-option.model.js";
import { ProductOptionValueModel } from "./product-option-value.model.js";
import { ProductVariantModel } from "./product-variant.model.js";
import { VariantPriceModel } from "./variant-price.model.js";
import { VariantInventoryModel } from "./variant-inventory.model.js";
import { VariantImageModel } from "./variant-image.model.js";
import { VariantAttributesModel } from "./variant-attributes.model.js";
import { OptionTemplateModel } from "./option-template.model.js";
import { checkFeature } from "../../features/feature-access.service.js";
import { PlanFeatureModel } from "../../features/plan-feature.model.js";
import { StoreModel } from "../../stores/store.model.js";
import {
  removeEntityMediaReferences,
  resolveMediaFiles,
  syncEntityMediaReferences,
} from "../../media/media-reference.service.js";
import {
  bulkVariantSchema,
  optionTemplateSchema,
  syncVariantsSchema,
  type OptionInput,
  type VariantInput,
} from "./variant.validator.js";

export type HydratedVariant = {
  _id: string;
  title: string;
  optionValues: Record<string, string>;
  price?: number;
  comparePrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  barcode: string;
  imageUrl: string;
  imageMediaIds: string[];
  galleryUrls: string[];
  enabled: boolean;
  status: string;
  isDefault: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  allowPreOrder: boolean;
  allowBackorder: boolean;
  isComingSoon: boolean;
  weight?: number;
  weightUnit?: string;
  dimensions?: Record<string, unknown>;
  taxClass?: string;
  seo?: Record<string, string>;
  attributes?: Record<string, string>;
};

export type HydratedOption = {
  _id: string;
  name: string;
  values: string[];
  displayType: string;
  position: number;
  valueDetails: Array<{ _id: string; value: string; colorHex?: string; imageUrl?: string }>;
};

function comboKey(optionValues: Record<string, string>) {
  return Object.entries(optionValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

function buildTitle(optionValues: Record<string, string>) {
  return Object.values(optionValues).join(" / ");
}

export function generateCombinations(options: Array<{ name: string; values: string[] }>) {
  if (options.length === 0) return [] as Record<string, string>[];
  const result: Record<string, string>[] = [];
  function recurse(idx: number, current: Record<string, string>) {
    if (idx === options.length) {
      result.push({ ...current });
      return;
    }
    for (const val of options[idx].values) {
      current[options[idx].name] = val;
      recurse(idx + 1, current);
    }
  }
  recurse(0, {});
  return result;
}

async function migrateEmbeddedVariants(product: {
  _id: unknown;
  storeId: unknown;
  options?: Array<{ name: string; values: string[] }>;
  variants?: Array<{
    optionValues?: Record<string, string> | Map<string, string>;
    price?: number;
    stock?: number;
    sku?: string;
    barcode?: string;
    imageUrl?: string;
    enabled?: boolean;
  }>;
  price?: number;
}) {
  const productId = String(product._id);
  const storeId = String(product.storeId);
  const embeddedOptions = product.options ?? [];
  const embeddedVariants = product.variants ?? [];
  if (embeddedOptions.length === 0 && embeddedVariants.length === 0) return;

  await syncProductVariants(productId, storeId, {
    options: embeddedOptions,
    variants: embeddedVariants.map((v) => {
      const optionValues =
        v.optionValues instanceof Map ? Object.fromEntries(v.optionValues) : (v.optionValues ?? {});
      return {
        optionValues,
        price: v.price,
        stock: v.stock ?? 0,
        sku: v.sku ?? "",
        barcode: v.barcode ?? "",
        imageUrl: v.imageUrl ?? "",
        enabled: v.enabled !== false,
      };
    }),
    productType: "variable",
  });

  await ProductModel.updateOne({ _id: productId }, { $set: { options: [], variants: [] } });
}

export async function loadProductOptions(productId: string): Promise<HydratedOption[]> {
  await connectDatabase();
  const options = await ProductOptionModel.find({ productId }).sort({ position: 1 }).lean();
  const values = await ProductOptionValueModel.find({ productId }).sort({ position: 1 }).lean();

  return options.map((opt) => {
    const optValues = values.filter((v) => String(v.optionId) === String(opt._id));
    return {
      _id: String(opt._id),
      name: opt.name,
      displayType: opt.displayType ?? "button",
      position: opt.position ?? 0,
      values: optValues.map((v) => v.value),
      valueDetails: optValues.map((v) => ({
        _id: String(v._id),
        value: v.value,
        colorHex: v.colorHex ?? "",
        imageUrl: v.imageUrl ?? "",
      })),
    };
  });
}

export async function loadProductVariants(productId: string): Promise<HydratedVariant[]> {
  await connectDatabase();
  const variants = await ProductVariantModel.find({ productId, status: { $ne: "archived" } })
    .sort({ position: 1 })
    .lean();
  if (variants.length === 0) return [];

  const variantIds = variants.map((v) => v._id);
  const [prices, inventories, images, attributes, optionValues, options] = await Promise.all([
    VariantPriceModel.find({ variantId: { $in: variantIds } }).lean(),
    VariantInventoryModel.find({ variantId: { $in: variantIds } }).lean(),
    VariantImageModel.find({ variantId: { $in: variantIds } }).sort({ position: 1 }).lean(),
    VariantAttributesModel.find({ variantId: { $in: variantIds } }).lean(),
    ProductOptionValueModel.find({ productId }).lean(),
    ProductOptionModel.find({ productId }).lean(),
  ]);

  return variants.map((v) => {
    const price = prices.find((p) => String(p.variantId) === String(v._id));
    const inv = inventories.find((i) => String(i.variantId) === String(v._id));
    const imgs = images.filter((i) => String(i.variantId) === String(v._id));
    const attrs = attributes.filter((a) => String(a.variantId) === String(v._id));

    const optionValuesMap: Record<string, string> = {};
    for (const valId of v.optionValueIds ?? []) {
      const val = optionValues.find((ov) => String(ov._id) === String(valId));
      if (!val) continue;
      const opt = options.find((o) => String(o._id) === String(val.optionId));
      if (opt) optionValuesMap[opt.name] = val.value;
    }

    const attrMap: Record<string, string> = {};
    for (const a of attrs) attrMap[a.key] = a.value;

    return {
      _id: String(v._id),
      title: v.title,
      optionValues: optionValuesMap,
      price: price?.sellingPrice,
      comparePrice: price?.comparePrice,
      wholesalePrice: price?.wholesalePrice,
      costPrice: price?.costPrice,
      stock: inv?.quantity ?? 0,
      lowStockThreshold: inv?.lowStockThreshold ?? 5,
      sku: v.sku ?? "",
      barcode: v.barcode ?? "",
      imageUrl: imgs[0]?.url ?? "",
      imageMediaIds: imgs.map((img) => (img.mediaId ? String(img.mediaId) : "")).filter(Boolean),
      galleryUrls: imgs.map((i) => i.url),
      enabled: v.status === "active",
      status: v.status ?? "active",
      isDefault: v.isDefault ?? false,
      isFeatured: v.isFeatured ?? false,
      isBestSeller: v.isBestSeller ?? false,
      allowPreOrder: v.allowPreOrder ?? false,
      allowBackorder: v.allowBackorder ?? false,
      isComingSoon: v.isComingSoon ?? false,
      weight: v.weight,
      weightUnit: v.weightUnit,
      dimensions: v.dimensions as Record<string, unknown> | undefined,
      taxClass: v.taxClass,
      seo: v.seo as Record<string, string> | undefined,
      attributes: Object.keys(attrMap).length ? attrMap : undefined,
    };
  });
}

export async function hydrateProduct<T extends Record<string, unknown>>(product: T) {
  await connectDatabase();
  const productId = String(product._id);

  const existingCount = await ProductVariantModel.countDocuments({ productId });
  if (existingCount === 0 && ((product.options as unknown[])?.length || (product.variants as unknown[])?.length)) {
    await migrateEmbeddedVariants(product as unknown as Parameters<typeof migrateEmbeddedVariants>[0]);
  }

  const [options, variants] = await Promise.all([
    loadProductOptions(productId),
    loadProductVariants(productId),
  ]);

  const prices = variants.map((v) => v.price).filter((p): p is number => typeof p === "number");
  const minPrice = prices.length ? Math.min(...prices) : (product.price as number);
  const maxPrice = prices.length ? Math.max(...prices) : (product.price as number);
  const totalStock = variants.length
    ? variants.filter((v) => v.enabled).reduce((sum, v) => sum + v.stock, 0)
    : ((product.stock as number) ?? 0);

  return {
    ...product,
    productType: variants.length > 0 ? "variable" : (product.productType ?? "simple"),
    options: options.map((o) => ({ _id: o._id, name: o.name, values: o.values, displayType: o.displayType })),
    optionDetails: options,
    variants,
    priceMin: minPrice,
    priceMax: maxPrice,
    priceRange: minPrice !== maxPrice ? { min: minPrice, max: maxPrice } : undefined,
    totalStock,
  };
}

export async function checkVariantFeature(storeId: string) {
  const feature = await checkFeature(storeId, "product_variants");
  if (!feature.allowed) {
    return { ok: false as const, message: feature.message ?? "Product variants are not available on your plan" };
  }
  return { ok: true as const };
}

export async function attachProductVariantSummary<T extends Record<string, unknown>>(product: T) {
  await connectDatabase();
  const productId = String(product._id);

  const existingCount = await ProductVariantModel.countDocuments({ productId, status: { $ne: "archived" } });
  if (existingCount === 0) {
    const embeddedCount = (product.variants as unknown[])?.length ?? 0;
    return { ...product, variantCount: embeddedCount };
  }

  const [prices, inventories, options] = await Promise.all([
    VariantPriceModel.find({ productId }).select("sellingPrice").lean(),
    VariantInventoryModel.find({ productId }).select("quantity").lean(),
    ProductOptionModel.find({ productId }).select("name").lean(),
  ]);

  const sellingPrices = prices.map((p) => p.sellingPrice).filter((p) => typeof p === "number");
  const totalStock = inventories.reduce((sum, i) => sum + (i.quantity ?? 0), 0);

  return {
    ...product,
    productType: "variable",
    variantCount: existingCount,
    options: options.map((o) => ({ name: o.name, values: [] })),
    priceMin: sellingPrices.length ? Math.min(...sellingPrices) : product.price,
    priceMax: sellingPrices.length ? Math.max(...sellingPrices) : product.price,
    priceRange:
      sellingPrices.length && Math.min(...sellingPrices) !== Math.max(...sellingPrices)
        ? { min: Math.min(...sellingPrices), max: Math.max(...sellingPrices) }
        : undefined,
    totalStock,
  };
}

export async function checkVariantCountLimit(storeId: string, _productId: string, newCount: number) {
  const feature = await checkFeature(storeId, "product_variants");
  if (!feature.allowed) {
    return { ok: false as const, message: feature.message ?? "Product variants are not available on your plan" };
  }

  await connectDatabase();
  const store = (await StoreModel.findById(storeId).lean()) as { planId?: unknown } | null;
  if (!store?.planId) return { ok: true as const };

  const assignment = (await PlanFeatureModel.findOne({
    planId: store.planId,
    featureKey: "product_variants",
  }).lean()) as { limit?: number; enabled?: boolean } | null;

  if (assignment?.enabled === false) {
    return { ok: false as const, message: "Product variants are disabled on your plan" };
  }

  const max = assignment?.limit ?? 0;
  if (max === 0) return { ok: true as const };
  if (newCount > max) {
    return {
      ok: false as const,
      message: `Your plan allows up to ${max} variants per product. Upgrade to add more.`,
    };
  }
  return { ok: true as const };
}

async function upsertOptions(productId: string, storeId: string, options: OptionInput[]) {
  const existingOptions = await ProductOptionModel.find({ productId }).lean();
  const keepOptionIds = new Set<string>();

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    let optionDoc = opt._id ? await ProductOptionModel.findOne({ _id: opt._id, productId }) : null;
    if (!optionDoc) {
      optionDoc = await ProductOptionModel.create({
        storeId,
        productId,
        name: opt.name,
        position: opt.position ?? i,
        displayType: opt.displayType ?? "button",
      });
    } else {
      optionDoc.name = opt.name;
      optionDoc.position = opt.position ?? i;
      if (opt.displayType) optionDoc.displayType = opt.displayType;
      await optionDoc.save();
    }
    keepOptionIds.add(String(optionDoc._id));

    const existingValues = await ProductOptionValueModel.find({ optionId: optionDoc._id }).lean();
    const keepValueIds = new Set<string>();

    for (let vi = 0; vi < opt.values.length; vi++) {
      const valueLabel = opt.values[vi];
      let valueDoc = existingValues.find((v) => v.value === valueLabel) as { _id: unknown } | undefined;
      if (!valueDoc) {
        const created = await ProductOptionValueModel.create({
          storeId,
          productId,
          optionId: optionDoc._id,
          value: valueLabel,
          position: vi,
        });
        valueDoc = created.toObject() as { _id: unknown };
      } else {
        await ProductOptionValueModel.updateOne({ _id: valueDoc._id }, { $set: { position: vi } });
      }
      keepValueIds.add(String(valueDoc._id));
    }

    await ProductOptionValueModel.deleteMany({
      optionId: optionDoc._id,
      _id: { $nin: Array.from(keepValueIds) },
    });
  }

  const removedOptions = existingOptions.filter((o) => !keepOptionIds.has(String(o._id)));
  if (removedOptions.length) {
    const removedIds = removedOptions.map((o) => o._id);
    await ProductOptionValueModel.deleteMany({ optionId: { $in: removedIds } });
    await ProductOptionModel.deleteMany({ _id: { $in: removedIds } });
  }
}

async function resolveOptionValueIds(productId: string, optionValues: Record<string, string>) {
  const options = await ProductOptionModel.find({ productId }).lean();
  const valueIds: string[] = [];
  for (const [name, val] of Object.entries(optionValues)) {
    const opt = options.find((o) => o.name === name) as { _id: unknown; name: string } | undefined;
    if (!opt) continue;
    const valueDoc = (await ProductOptionValueModel.findOne({ optionId: opt._id, value: val }).lean()) as
      | { _id: unknown }
      | null;
    if (valueDoc) valueIds.push(String(valueDoc._id));
  }
  return valueIds;
}

async function syncVariantRecords(
  productId: string,
  storeId: string,
  variants: VariantInput[],
  basePrice: number
) {
  const existing = await ProductVariantModel.find({ productId }).lean();
  const existingByKey = new Map<string, (typeof existing)[number]>();

  for (const v of existing) {
    const hydrated = await loadProductVariants(productId);
    const match = hydrated.find((h) => String(h._id) === String(v._id));
    if (match) existingByKey.set(comboKey(match.optionValues), v);
  }

  const keepIds = new Set<string>();

  for (let i = 0; i < variants.length; i++) {
    const input = variants[i];
    const key = comboKey(input.optionValues);
    const optionValueIds = await resolveOptionValueIds(productId, input.optionValues);
    const title = input.title ?? buildTitle(input.optionValues);
    const status =
      input.status ?? (input.enabled === false ? "hidden" : input.stock === 0 ? "out_of_stock" : "active");

    let variantDoc = input._id
      ? await ProductVariantModel.findOne({ _id: input._id, productId })
      : (existingByKey.get(key) ?? null);

    if (!variantDoc) {
      variantDoc = await ProductVariantModel.create({
        storeId,
        productId,
        title,
        optionValueIds,
        sku: input.sku ?? "",
        barcode: input.barcode ?? "",
        status,
        isDefault: input.isDefault ?? i === 0,
        isFeatured: input.isFeatured ?? false,
        isBestSeller: input.isBestSeller ?? false,
        allowPreOrder: input.allowPreOrder ?? false,
        allowBackorder: input.allowBackorder ?? false,
        isComingSoon: input.isComingSoon ?? false,
        weight: input.weight,
        weightUnit: input.weightUnit,
        dimensions: input.dimensions,
        taxClass: input.taxClass,
        seo: input.seo,
        position: i,
      });
    } else {
      variantDoc.title = title;
      variantDoc.optionValueIds = optionValueIds as never;
      variantDoc.sku = input.sku ?? variantDoc.sku;
      variantDoc.barcode = input.barcode ?? variantDoc.barcode;
      variantDoc.status = status;
      if (input.isDefault !== undefined) variantDoc.isDefault = input.isDefault;
      if (input.isFeatured !== undefined) variantDoc.isFeatured = input.isFeatured;
      if (input.isBestSeller !== undefined) variantDoc.isBestSeller = input.isBestSeller;
      if (input.allowPreOrder !== undefined) variantDoc.allowPreOrder = input.allowPreOrder;
      if (input.allowBackorder !== undefined) variantDoc.allowBackorder = input.allowBackorder;
      if (input.isComingSoon !== undefined) variantDoc.isComingSoon = input.isComingSoon;
      variantDoc.position = i;
      await variantDoc.save();
    }

    const variantId = String(variantDoc._id);
    keepIds.add(variantId);

    const sellingPrice = input.price ?? basePrice;
    await VariantPriceModel.findOneAndUpdate(
      { variantId },
      {
        $set: {
          storeId,
          productId,
          variantId,
          sellingPrice,
          comparePrice: input.comparePrice,
          wholesalePrice: input.wholesalePrice,
          costPrice: input.costPrice,
        },
      },
      { upsert: true, new: true }
    );

    await VariantInventoryModel.findOneAndUpdate(
      { variantId },
      {
        $set: {
          storeId,
          productId,
          variantId,
          quantity: input.stock ?? 0,
          lowStockThreshold: input.lowStockThreshold ?? 5,
          trackInventory: true,
        },
      },
      { upsert: true, new: true }
    );

    const galleryMediaIds = input.imageMediaIds?.length ? input.imageMediaIds : [];
    let gallery = input.galleryUrls?.length ? input.galleryUrls : input.imageUrl ? [input.imageUrl] : [];

    if (galleryMediaIds.length > 0) {
      const mediaMap = await resolveMediaFiles(storeId, galleryMediaIds);
      gallery = galleryMediaIds.map((id) => mediaMap.get(id)?.publicUrl ?? "").filter(Boolean);
    }

    await VariantImageModel.deleteMany({ variantId });
    for (let gi = 0; gi < gallery.length; gi++) {
      await VariantImageModel.create({
        storeId,
        productId,
        variantId,
        mediaId: galleryMediaIds[gi] ?? null,
        url: gallery[gi],
        thumbnailUrl: gallery[gi],
        position: gi,
      });
    }

    await syncEntityMediaReferences(
      storeId,
      "product_variant",
      String(variantId),
      galleryMediaIds.map((mediaId, index) => ({
        fieldPath: `galleryImages.${index}`,
        mediaFileId: mediaId,
        label: `Variant Image ${index + 1}`,
      }))
    );

    if (input.attributes) {
      for (const [attrKey, attrVal] of Object.entries(input.attributes)) {
        await VariantAttributesModel.findOneAndUpdate(
          { variantId, key: attrKey },
          { $set: { storeId, productId, variantId, key: attrKey, value: attrVal } },
          { upsert: true }
        );
      }
    }
  }

  const toRemove = existing.filter((v) => !keepIds.has(String(v._id))).map((v) => v._id);
  if (toRemove.length) {
    for (const variantId of toRemove) {
      await removeEntityMediaReferences(storeId, "product_variant", String(variantId));
    }
    await ProductVariantModel.deleteMany({ _id: { $in: toRemove } });
    await VariantPriceModel.deleteMany({ variantId: { $in: toRemove } });
    await VariantInventoryModel.deleteMany({ variantId: { $in: toRemove } });
    await VariantImageModel.deleteMany({ variantId: { $in: toRemove } });
    await VariantAttributesModel.deleteMany({ variantId: { $in: toRemove } });
  }
}

async function updateProductAggregates(productId: string, storeId: string, productType?: string) {
  const variants = await loadProductVariants(productId);
  const product = await ProductModel.findOne({ _id: productId, storeId });
  if (!product) return;

  if (variants.length > 0) {
    const prices = variants.map((v) => v.price ?? product.price).filter((p) => p >= 0);
    const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
    product.productType = "variable";
    product.price = defaultVariant?.price ?? Math.min(...prices);
    product.comparePrice = defaultVariant?.comparePrice;
    product.stock = variants.reduce((sum, v) => sum + (v.enabled ? v.stock : 0), 0);
    product.sku = defaultVariant?.sku ?? product.sku;
    product.imageUrl = defaultVariant?.imageUrl || product.imageUrl;
    await ProductModel.updateOne({ _id: productId }, { $set: { options: [], variants: [] } });
  } else if (productType) {
    product.productType = productType;
  }

  await product.save();
}

export async function syncProductVariants(productId: string, storeId: string, payload: unknown) {
  const parsed = syncVariantsSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid variant data" };

  const featureCheck = await checkVariantFeature(storeId);
  if (!featureCheck.ok) return featureCheck;

  if (parsed.data.variants.length > 0) {
    const limitCheck = await checkVariantCountLimit(storeId, productId, parsed.data.variants.length);
    if (!limitCheck.ok) return limitCheck;
  }

  await connectDatabase();
  const product = await ProductModel.findOne({ _id: productId, storeId });
  if (!product) return { ok: false as const, message: "Product not found" };

  await upsertOptions(productId, storeId, parsed.data.options);
  await syncVariantRecords(productId, storeId, parsed.data.variants, product.price);
  await updateProductAggregates(productId, storeId, parsed.data.productType);

  const hydrated = await hydrateProduct(product.toObject() as Record<string, unknown>);
  return { ok: true as const, data: { product: hydrated } };
}

export async function generateProductVariants(productId: string, storeId: string) {
  await connectDatabase();
  const options = await loadProductOptions(productId);
  if (options.length === 0) return { ok: false as const, message: "Add options before generating variants" };

  const combos = generateCombinations(options.map((o) => ({ name: o.name, values: o.values })));
  const existing = await loadProductVariants(productId);

  const merged = combos.map((combo) => {
    const key = comboKey(combo);
    const found = existing.find((v) => comboKey(v.optionValues) === key);
    return (
      found ?? {
        optionValues: combo,
        stock: 0,
        sku: "",
        imageUrl: "",
        enabled: true,
      }
    );
  });

  return syncProductVariants(productId, storeId, {
    options: options.map((o) => ({ name: o.name, values: o.values })),
    variants: merged,
  });
}

export async function resolveVariantForCart(storeId: string, productId: string, variantId?: string) {
  const product = await ProductModel.findOne({ _id: productId, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };

  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  const variants = hydrated.variants as HydratedVariant[];

  if (variants.length > 0) {
    if (!variantId) return { ok: false as const, message: "Please select a product variant" };
    const variant = variants.find((v) => v._id === variantId);
    if (!variant || !variant.enabled) return { ok: false as const, message: "Variant not found" };
    if (variant.stock <= 0 && !variant.allowBackorder && !variant.allowPreOrder) {
      return { ok: false as const, message: "This variant is out of stock" };
    }
    return {
      ok: true as const,
      data: {
        price: variant.price ?? (hydrated.price as number),
        image: variant.imageUrl || (hydrated.imageUrl as string) || "",
        variantTitle: variant.title || buildTitle(variant.optionValues),
        sku: variant.sku,
        stock: variant.stock,
      },
    };
  }

  return {
    ok: true as const,
    data: {
      price: hydrated.price as number,
      image: (hydrated.imageUrl as string) || ((hydrated.images as string[])?.[0] ?? ""),
      variantTitle: "",
      sku: hydrated.sku as string,
      stock: hydrated.stock as number,
    },
  };
}

export async function bulkUpdateVariants(storeId: string, productId: string, payload: unknown) {
  const parsed = bulkVariantSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid bulk request" };

  const bulkFeature = await checkFeature(storeId, "variant_bulk_tools");
  if (!bulkFeature.allowed) {
    return { ok: false as const, message: bulkFeature.message ?? "Bulk variant tools require a higher plan" };
  }

  await connectDatabase();
  const { variantIds, action } = parsed.data;

  if (action === "delete") {
    for (const variantId of variantIds) {
      await removeEntityMediaReferences(storeId, "product_variant", String(variantId));
    }
    await ProductVariantModel.deleteMany({ _id: { $in: variantIds }, storeId, productId });
    await VariantPriceModel.deleteMany({ variantId: { $in: variantIds } });
    await VariantInventoryModel.deleteMany({ variantId: { $in: variantIds } });
    await VariantImageModel.deleteMany({ variantId: { $in: variantIds } });
    await VariantAttributesModel.deleteMany({ variantId: { $in: variantIds } });
    await updateProductAggregates(productId, storeId);
    return { ok: true as const, data: { deleted: variantIds.length } };
  }

  if (action === "update_price" && parsed.data.price !== undefined) {
    await VariantPriceModel.updateMany(
      { variantId: { $in: variantIds }, storeId },
      { $set: { sellingPrice: parsed.data.price } }
    );
  }

  if (action === "update_stock" && parsed.data.stock !== undefined) {
    await VariantInventoryModel.updateMany(
      { variantId: { $in: variantIds }, storeId },
      { $set: { quantity: parsed.data.stock } }
    );
  }

  if (action === "generate_sku") {
    for (let i = 0; i < variantIds.length; i++) {
      await ProductVariantModel.updateOne(
        { _id: variantIds[i], storeId },
        { $set: { sku: `VAR-${productId.slice(-6)}-${i + 1}` } }
      );
    }
  }

  if (action === "generate_barcode") {
    for (let i = 0; i < variantIds.length; i++) {
      await ProductVariantModel.updateOne(
        { _id: variantIds[i], storeId },
        { $set: { barcode: `${Date.now()}${i}` } }
      );
    }
  }

  await updateProductAggregates(productId, storeId);
  const product = await ProductModel.findOne({ _id: productId, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  const hydrated = await hydrateProduct(product as Record<string, unknown>);
  return { ok: true as const, data: { product: hydrated } };
}

export async function deleteProductVariants(productId: string) {
  await connectDatabase();
  const variants = await ProductVariantModel.find({ productId }).select("_id storeId").lean();
  const variantIds = variants.map((v) => v._id);
  const storeId = variants[0]?.storeId ? String(variants[0].storeId) : "";
  await ProductOptionModel.deleteMany({ productId });
  await ProductOptionValueModel.deleteMany({ productId });
  await ProductVariantModel.deleteMany({ productId });
  if (variantIds.length) {
    if (storeId) {
      for (const variantId of variantIds) {
        await removeEntityMediaReferences(storeId, "product_variant", String(variantId));
      }
    }
    await VariantPriceModel.deleteMany({ variantId: { $in: variantIds } });
    await VariantInventoryModel.deleteMany({ variantId: { $in: variantIds } });
    await VariantImageModel.deleteMany({ variantId: { $in: variantIds } });
    await VariantAttributesModel.deleteMany({ variantId: { $in: variantIds } });
  }
}

export async function listOptionTemplates() {
  await connectDatabase();
  const templates = await OptionTemplateModel.find({ isGlobal: true }).sort({ name: 1 }).lean();
  return { ok: true as const, data: { templates } };
}

export async function createOptionTemplate(payload: unknown, createdBy?: string) {
  const parsed = optionTemplateSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid template data" };
  await connectDatabase();
  const template = await OptionTemplateModel.create({ ...parsed.data, isGlobal: true, createdBy });
  return { ok: true as const, data: { template: template.toObject() } };
}

export async function searchVariants(
  storeId: string,
  filters: { search?: string; status?: string; minPrice?: number; maxPrice?: number }
) {
  await connectDatabase();
  const products = await ProductModel.find({ storeId }).select("_id name slug").lean();
  const productIds = products.map((p) => p._id);
  const variants = await ProductVariantModel.find({
    storeId,
    productId: { $in: productIds },
    ...(filters.status ? { status: filters.status } : {}),
  }).lean();

  const rows = [];
  for (const v of variants) {
    const hydrated = (await loadProductVariants(String(v.productId))).find((h) => h._id === String(v._id));
    if (!hydrated) continue;
    const product = products.find((p) => String(p._id) === String(v.productId));
    const q = filters.search?.toLowerCase();
    if (q) {
      const hay = `${hydrated.sku} ${hydrated.barcode} ${hydrated.title} ${Object.values(hydrated.optionValues).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    if (filters.minPrice !== undefined && (hydrated.price ?? 0) < filters.minPrice) continue;
    if (filters.maxPrice !== undefined && (hydrated.price ?? 0) > filters.maxPrice) continue;
    rows.push({
      ...hydrated,
      productId: String(v.productId),
      productName: product?.name,
      productSlug: product?.slug,
    });
  }
  return { ok: true as const, data: { variants: rows } };
}

export async function decrementVariantStock(
  storeId: string,
  productId: string,
  variantId: string,
  quantity: number
) {
  await connectDatabase();
  const inv = await VariantInventoryModel.findOne({ variantId, storeId, productId });
  if (!inv) return false;
  inv.quantity = Math.max(0, inv.quantity - quantity);
  await inv.save();
  await updateProductAggregates(productId, storeId);
  return true;
}
