/**
 * Product seed for the existing "nayeem" store.
 * Does NOT create a store — only categories + products + variants.
 *
 * Idempotent: skips when 50+ seeded products exist unless FORCE_NAYEEM_PRODUCTS=true.
 */
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { StoreModel } from "../models/store.model.js";
import { CategoryModel } from "../models/category.model.js";
import { ProductModel } from "../models/product.model.js";
import { ProductVariantModel } from "../modules/products/variants/product-variant.model.js";
import { ProductOptionModel } from "../modules/products/variants/product-option.model.js";
import { ProductOptionValueModel } from "../modules/products/variants/product-option-value.model.js";
import { VariantPriceModel } from "../modules/products/variants/variant-price.model.js";
import { VariantInventoryModel } from "../modules/products/variants/variant-inventory.model.js";
import { VariantImageModel } from "../modules/products/variants/variant-image.model.js";

export const NAYEEM_EXISTING_STORE_ID = "6a5737692f76b860979ef38f";
const SEED_SKU_PREFIX = "NAY-";

const PRICES = [399, 699, 999, 1499, 1999, 2999, 4999, 7999, 12999] as const;
const BRANDS = ["Nayeem", "Samsung", "Apple", "Logitech", "Nike", "Adidas", "Xiaomi"] as const;
const COLORS = ["Black", "White", "Blue", "Red", "Green", "Silver", "Gray"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const STORAGE = ["64GB", "128GB", "256GB", "512GB"] as const;

const CATEGORIES = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Footwear", slug: "footwear" },
  { name: "Accessories", slug: "accessories" },
  { name: "Home & Living", slug: "home-living" },
  { name: "Sports", slug: "sports" },
  { name: "Beauty", slug: "beauty" },
  { name: "Books", slug: "books" },
] as const;

const PRODUCT_TEMPLATES: Record<string, string[]> = {
  Electronics: [
    "Wireless Earbuds Pro",
    "Bluetooth Speaker Mini",
    "Smart Watch Series",
    "USB-C Fast Charger",
    "Portable Power Bank",
    "Noise Cancelling Headphones",
    "Tablet Stand Adjustable",
  ],
  Fashion: [
    "Premium Cotton T-Shirt",
    "Slim Fit Denim Jeans",
    "Linen Casual Shirt",
    "Fleece Hoodie",
    "Formal Blazer",
    "Summer Midi Dress",
    "Cargo Jogger Pants",
  ],
  Footwear: [
    "Running Sneakers",
    "Leather Formal Shoes",
    "Canvas Slip-Ons",
    "Hiking Boots",
    "Sports Sandals",
    "Classic Loafers",
  ],
  Accessories: [
    "Leather Wallet",
    "Canvas Backpack",
    "Polarized Sunglasses",
    "Stainless Steel Watch",
    "Travel Duffel Bag",
    "Belt Gift Set",
  ],
  "Home & Living": [
    "Ceramic Dinner Set",
    "Memory Foam Pillow",
    "LED Desk Lamp",
    "Aroma Diffuser",
    "Non-Stick Cookware Set",
    "Cotton Bed Sheet Set",
  ],
  Sports: [
    "Yoga Mat Premium",
    "Adjustable Dumbbells",
    "Sports Water Bottle",
    "Resistance Bands Kit",
    "Football Size 5",
    "Cycling Gloves",
  ],
  Beauty: [
    "Vitamin C Face Serum",
    "Hydrating Face Wash",
    "Matte Lipstick Set",
    "SPF 50 Sunscreen",
    "Hair Growth Oil",
    "Charcoal Face Mask",
  ],
  Books: [
    "Atomic Habits",
    "The Psychology of Money",
    "Deep Work",
    "Start With Why",
    "Rich Dad Poor Dad",
    "Clean Code",
  ],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function imageUrl(seed: string, index: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(`${seed}-${index}`)}/800/800`;
}

function pickPrice(index: number) {
  return PRICES[index % PRICES.length];
}

function productName(category: string, index: number, brand: string) {
  const list = PRODUCT_TEMPLATES[category] ?? [`${category} Item`];
  const baseName = list[Math.floor(index / CATEGORIES.length) % list.length];
  return `${brand} ${baseName}`;
}

async function clearSeededProducts(storeId: mongoose.Types.ObjectId) {
  const seededProducts = await ProductModel.find({
    storeId,
    sku: { $regex: `^${SEED_SKU_PREFIX}` },
  }).select("_id");

  const productIds = seededProducts.map((p) => p._id);

  if (productIds.length === 0) return;

  await Promise.all([
    VariantImageModel.deleteMany({ storeId, productId: { $in: productIds } }),
    VariantInventoryModel.deleteMany({ storeId, productId: { $in: productIds } }),
    VariantPriceModel.deleteMany({ storeId, productId: { $in: productIds } }),
    ProductOptionValueModel.deleteMany({ storeId, productId: { $in: productIds } }),
    ProductOptionModel.deleteMany({ storeId, productId: { $in: productIds } }),
    ProductVariantModel.deleteMany({ storeId, productId: { $in: productIds } }),
    ProductModel.deleteMany({ _id: { $in: productIds } }),
  ]);
}

async function ensureCategories(storeId: mongoose.Types.ObjectId, storeName: string) {
  const categoryBySlug: Record<string, { _id: mongoose.Types.ObjectId; name: string; slug: string }> = {};

  for (const [index, cat] of CATEGORIES.entries()) {
    const existing = await CategoryModel.findOne({ storeId, slug: cat.slug });
    if (existing) {
      categoryBySlug[cat.slug] = {
        _id: existing._id as mongoose.Types.ObjectId,
        name: existing.name,
        slug: existing.slug,
      };
      continue;
    }

    const [created] = await CategoryModel.create([
      {
        storeId,
        name: cat.name,
        slug: cat.slug,
        description: faker.commerce.productDescription().slice(0, 160),
        active: true,
        featured: index < 3,
        sortOrder: index,
        metaTitle: `${cat.name} | ${storeName}`,
        metaDescription: `Browse ${cat.name.toLowerCase()} at ${storeName}.`,
        imageUrl: imageUrl(cat.slug, 0),
      },
    ]);

    categoryBySlug[cat.slug] = {
      _id: created._id as mongoose.Types.ObjectId,
      name: created.name,
      slug: created.slug,
    };
  }

  return categoryBySlug;
}

async function seedVariableProduct({
  storeId,
  product,
  price,
  comparePrice,
  categorySlug,
  images,
}: {
  storeId: mongoose.Types.ObjectId;
  product: { _id: unknown; name: string; slug: string };
  price: number;
  comparePrice?: number;
  categorySlug: string;
  images: string[];
}) {
  const productId = product._id as mongoose.Types.ObjectId;
  const isElectronics = categorySlug === "electronics" || categorySlug === "accessories";
  const primaryOption = isElectronics
    ? { name: "Storage", values: STORAGE.slice(0, 3) }
    : { name: "Color", values: COLORS.slice(0, 4) };
  const secondaryOption = isElectronics
    ? { name: "Color", values: COLORS.slice(0, 3) }
    : { name: "Size", values: SIZES.slice(0, 4) };

  const [primaryOpt] = await ProductOptionModel.create([
    { storeId, productId, name: primaryOption.name, position: 0, displayType: "button" },
  ]);
  const [secondaryOpt] = await ProductOptionModel.create([
    { storeId, productId, name: secondaryOption.name, position: 1, displayType: "button" },
  ]);

  const primaryValues = await ProductOptionValueModel.insertMany(
    primaryOption.values.map((value, position) => ({
      storeId,
      productId,
      optionId: primaryOpt._id,
      value,
      position,
      colorHex: primaryOption.name === "Color" ? faker.color.rgb() : "",
    })),
  );
  const secondaryValues = await ProductOptionValueModel.insertMany(
    secondaryOption.values.map((value, position) => ({
      storeId,
      productId,
      optionId: secondaryOpt._id,
      value,
      position,
      colorHex: secondaryOption.name === "Color" ? faker.color.rgb() : "",
    })),
  );

  let totalStock = 0;
  const embeddedVariants: Array<Record<string, unknown>> = [];
  const variantIds: mongoose.Types.ObjectId[] = [];

  for (const primary of primaryValues) {
    for (const secondary of secondaryValues.slice(0, 2)) {
      const title = `${product.name} - ${primary.value} / ${secondary.value}`;
      const variantPrice = price + faker.number.int({ min: 0, max: 800 });
      const stockRoll = faker.number.int({ min: 0, max: 10 });
      const variantStock =
        stockRoll === 0 ? 0 : stockRoll === 1 ? faker.number.int({ min: 2, max: 8 }) : faker.number.int({ min: 10, max: 150 });
      totalStock += variantStock;

      const variantSku = `${SEED_SKU_PREFIX}VAR-${slugify(product.slug)}-${slugify(`${primary.value}-${secondary.value}`)}`;

      const [variant] = await ProductVariantModel.create([
        {
          storeId,
          productId,
          title,
          optionValueIds: [primary._id, secondary._id],
          sku: variantSku,
          barcode: faker.commerce.isbn({ variant: 13 }).replace(/-/g, "").slice(0, 13),
          status: variantStock === 0 ? "out_of_stock" : variantStock <= 8 ? "active" : "active",
          isDefault: variantIds.length === 0,
          weight: faker.number.float({ min: 0.1, max: 1.8, fractionDigits: 2 }),
          weightUnit: "kg",
        },
      ]);

      variantIds.push(variant._id as mongoose.Types.ObjectId);

      await VariantPriceModel.create([
        {
          storeId,
          productId,
          variantId: variant._id,
          sellingPrice: variantPrice,
          comparePrice: comparePrice ? comparePrice + faker.number.int({ min: 100, max: 500 }) : undefined,
          costPrice: Math.round(variantPrice * faker.number.float({ min: 0.55, max: 0.7, fractionDigits: 2 })),
        },
      ]);

      await VariantInventoryModel.create([
        {
          storeId,
          productId,
          variantId: variant._id,
          quantity: variantStock,
          lowStockThreshold: 8,
          trackInventory: true,
        },
      ]);

      await VariantImageModel.insertMany(
        images.slice(0, faker.number.int({ min: 1, max: 3 })).map((url, position) => ({
          storeId,
          productId,
          variantId: variant._id,
          url,
          thumbnailUrl: url,
          position,
          alt: title,
        })),
      );

      embeddedVariants.push({
        optionValues: new Map([
          [primaryOption.name.toLowerCase(), primary.value],
          [secondaryOption.name.toLowerCase(), secondary.value],
        ]),
        price: variantPrice,
        stock: variantStock,
        sku: variantSku,
        barcode: faker.commerce.isbn({ variant: 13 }).replace(/-/g, "").slice(0, 13),
        imageUrl: images[0],
        enabled: variantStock > 0,
      });

      if (embeddedVariants.length >= 4) break;
    }
    if (embeddedVariants.length >= 4) break;
  }

  await ProductModel.updateOne(
    { _id: productId },
    {
      $set: {
        stock: totalStock,
        variants: embeddedVariants,
        defaultVariantId: variantIds[0],
        options: [
          { name: primaryOption.name, values: primaryOption.values },
          { name: secondaryOption.name, values: secondaryOption.values },
        ],
      },
    },
  );
}

export async function seedNayeemProducts() {
  faker.seed(202607222);

  const storeId = new mongoose.Types.ObjectId(
    process.env.NAYEEM_STORE_ID ?? NAYEEM_EXISTING_STORE_ID,
  );
  const force = process.env.FORCE_NAYEEM_PRODUCTS === "true";

  const store = await StoreModel.findById(storeId);
  if (!store) {
    throw new Error(
      `[seed] Store not found: ${storeId.toString()}. Aborting — will not create a new store.`,
    );
  }

  const seededCount = await ProductModel.countDocuments({
    storeId,
    sku: { $regex: `^${SEED_SKU_PREFIX}` },
  });

  if (seededCount >= 50 && !force) {
    console.log(
      `[seed] nayeem store already has ${seededCount} seeded products. Set FORCE_NAYEEM_PRODUCTS=true to re-run.`,
    );
    return { storeId: storeId.toString(), skipped: true, productCount: seededCount };
  }

  if (force && seededCount > 0) {
    console.log(`[seed] Clearing ${seededCount} previously seeded products from "${store.name}"…`);
    await clearSeededProducts(storeId);
  }

  const categoryBySlug = await ensureCategories(storeId, store.name);

  let created = 0;

  for (let i = 0; i < 50; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const brand = faker.helpers.arrayElement(BRANDS);
    const name = productName(category.name, i, brand);
    const slug = slugify(`${name}-${i + 1}`);
    const price = pickPrice(i);
    const comparePrice = i % 3 === 0 ? Math.round(price * faker.number.float({ min: 1.15, max: 1.35, fractionDigits: 2 })) : undefined;
    const isVariable = i % 4 === 0;

    const stockRoll = i % 13;
    const stock = isVariable
      ? 0
      : stockRoll === 0
        ? 0
        : stockRoll <= 2
          ? faker.number.int({ min: 2, max: 8 })
          : faker.number.int({ min: 10, max: 150 });

    const imageCount = faker.number.int({ min: 3, max: 5 });
    const images = Array.from({ length: imageCount }, (_, imgIdx) => imageUrl(slug, imgIdx));

    const shortDescription = faker.commerce.productDescription().slice(0, 120);
    const description = `${shortDescription} ${faker.commerce.productDescription()} Designed for reliable everyday use with thoughtful details and dependable quality. Ships nationwide across Bangladesh.`;

    const sku = `${SEED_SKU_PREFIX}${category.slug.toUpperCase().slice(0, 3).replace("-", "")}-${String(i + 1).padStart(4, "0")}`;
    const tags = faker.helpers.arrayElements(
      [category.slug, brand.toLowerCase(), "nayeem", "bestseller", "new-arrival", "limited", "premium"],
      { min: 2, max: 5 },
    );

    const [product] = await ProductModel.create([
      {
        storeId,
        name,
        slug,
        description,
        productType: isVariable ? "variable" : "simple",
        price,
        comparePrice,
        category: category.slug,
        categoryIds: [categoryBySlug[category.slug]._id],
        tags,
        brand,
        vendor: brand,
        barcode: `880${faker.string.numeric(10)}`,
        stock,
        trackInventory: true,
        lowStockThreshold: 8,
        status: i % 17 === 0 ? "draft" : "active",
        sku,
        imageUrl: images[0],
        thumbnailUrl: images[0],
        galleryImageUrls: images,
        images,
        featured: i % 7 === 0,
        weight: faker.number.float({ min: 0.12, max: 3.2, fractionDigits: 2 }),
        weightUnit: "kg",
        seo: {
          title: `${name} | ${store.name}`,
          description: shortDescription,
          keywords: [brand, category.name, store.name, ...tags.slice(0, 2)],
        },
      },
    ]);

    if (isVariable) {
      await seedVariableProduct({
        storeId,
        product,
        price,
        comparePrice,
        categorySlug: category.slug,
        images,
      });
    }

    created += 1;
  }

  console.log(`[seed] "${store.name}" (${store.slug}): ${created} products seeded for store ${storeId.toString()}`);
  return { storeId: storeId.toString(), skipped: false, productCount: created };
}
