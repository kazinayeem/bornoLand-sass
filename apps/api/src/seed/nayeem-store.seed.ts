/**
 * Production-like demo seed for Nayeem Store.
 * Mongoose/MongoDB — this project does not use Prisma.
 *
 * Idempotent: skips if the store already has 50+ products unless FORCE_NAYEEM_SEED=true.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { UserModel } from "../models/user.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { StoreModel } from "../models/store.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { CategoryModel } from "../models/category.model.js";
import { ProductModel } from "../models/product.model.js";
import { ProductVariantModel } from "../modules/products/variants/product-variant.model.js";
import { ProductOptionModel } from "../modules/products/variants/product-option.model.js";
import { ProductOptionValueModel } from "../modules/products/variants/product-option-value.model.js";
import { VariantPriceModel } from "../modules/products/variants/variant-price.model.js";
import { VariantInventoryModel } from "../modules/products/variants/variant-inventory.model.js";
import { VariantImageModel } from "../modules/products/variants/variant-image.model.js";
import { CustomerModel } from "../modules/customers/customer.model.js";
import { AddressModel } from "../modules/customers/address.model.js";
import { OrderModel } from "../modules/orders/order.model.js";
import { CouponModel } from "../modules/coupons/coupon.model.js";
import { ReviewModel } from "../modules/reviews/review.model.js";
import { DailyAnalyticModel } from "../modules/analytics/daily-analytic.model.js";
import { MonthlyAnalyticModel } from "../modules/analytics/monthly-analytic.model.js";
import { StoreSettingsModel } from "../modules/stores/store-settings.model.js";
import { StoreContactModel } from "../modules/stores/store-contact.model.js";
import { syncCustomerOrderStats } from "../modules/customers/customer.service.js";

export const NAYEEM_SEED_CONFIG = {
  storeName: "Nayeem Store",
  storeSlug: "nayeem-store",
  subdomain: "nayeem-store",
  tenantName: "Nayeem Workspace",
  tenantSlug: "nayeem-store",
  ownerName: "Nayeem Ahmed",
  ownerEmail: process.env.NAYEEM_OWNER_EMAIL ?? "nayeem@nayeemstore.com",
  ownerPassword: process.env.NAYEEM_OWNER_PASSWORD ?? "Nayeem@123",
} as const;

const PRICES = [399, 699, 999, 1299, 1499, 1999, 2499, 2999, 4999, 7999] as const;
const BRANDS = ["Nayeem", "Samsung", "Apple", "Logitech", "Nike", "Adidas", "Xiaomi"] as const;
const COLORS = ["Black", "White", "Blue", "Red", "Green", "Silver"] as const;
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

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const BD_CITIES = [
  { city: "Dhaka", state: "Dhaka Division", zip: "1205" },
  { city: "Chattogram", state: "Chittagong Division", zip: "4000" },
  { city: "Sylhet", state: "Sylhet Division", zip: "3100" },
  { city: "Khulna", state: "Khaka Division", zip: "9100" },
  { city: "Rajshahi", state: "Rajshahi Division", zip: "6000" },
];

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

function productTemplates(category: string, index: number) {
  const templates: Record<string, string[]> = {
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
  const list = templates[category] ?? [`${category} Item`];
  return list[index % list.length];
}

async function clearStoreSeedData(storeId: mongoose.Types.ObjectId) {
  const id = storeId;
  await Promise.all([
    OrderModel.deleteMany({ storeId: id }),
    ReviewModel.deleteMany({ storeId: id }),
    CouponModel.deleteMany({ storeId: id }),
    AddressModel.deleteMany({ storeId: id }),
    CustomerModel.deleteMany({ storeId: id }),
    VariantImageModel.deleteMany({ storeId: id }),
    VariantInventoryModel.deleteMany({ storeId: id }),
    VariantPriceModel.deleteMany({ storeId: id }),
    ProductOptionValueModel.deleteMany({ storeId: id }),
    ProductOptionModel.deleteMany({ storeId: id }),
    ProductVariantModel.deleteMany({ storeId: id }),
    ProductModel.deleteMany({ storeId: id }),
    CategoryModel.deleteMany({ storeId: id }),
    DailyAnalyticModel.deleteMany({ storeId: id }),
    MonthlyAnalyticModel.deleteMany({ storeId: id }),
  ]);
}

export async function seedNayeemStore() {
  faker.seed(20260722);

  const cfg = NAYEEM_SEED_CONFIG;
  const force = process.env.FORCE_NAYEEM_SEED === "true";

  let store = await StoreModel.findOne({ slug: cfg.storeSlug });
  if (store) {
    const existingProducts = await ProductModel.countDocuments({ storeId: store._id });
    if (existingProducts >= 50 && !force) {
      console.log(
        `[seed] Nayeem Store already seeded (${existingProducts} products). Set FORCE_NAYEEM_SEED=true to re-run.`,
      );
      return { storeId: String(store._id), skipped: true };
    }
    if (force || existingProducts > 0) {
      console.log("[seed] Clearing existing Nayeem Store seed data...");
      await clearStoreSeedData(store._id as mongoose.Types.ObjectId);
    }
  }

  try {
    const passwordHash = await bcrypt.hash(cfg.ownerPassword, 12);

    let tenant = await TenantModel.findOne({ slug: cfg.tenantSlug });
    if (!tenant) {
      [tenant] = await TenantModel.create(
        [
          {
            name: cfg.tenantName,
            slug: cfg.tenantSlug,
            subdomain: cfg.subdomain,
            plan: "growth",
            status: "active",
            branding: { primaryColor: "#0066cc", accentColor: "#0f172a" },
          },
        ],
        
      );
    }

    let owner = await UserModel.findOne({ email: cfg.ownerEmail });
    if (!owner) {
      [owner] = await UserModel.create(
        [
          {
            name: cfg.ownerName,
            email: cfg.ownerEmail,
            passwordHash,
            role: "owner",
            tenantId: tenant._id,
            status: "active",
            phone: "+8801712345678",
            country: "Bangladesh",
            timezone: "Asia/Dhaka",
            storeName: cfg.storeName,
          },
        ],
        
      );
    }

    await TeamMemberModel.updateOne(
      { tenantId: tenant._id, userId: owner._id },
      {
        $set: {
          role: "owner",
          status: "active",
          invitedAt: new Date(),
          acceptedAt: new Date(),
        },
      },
      { upsert: true },
    );

    if (!store) {
      [store] = await StoreModel.create(
        [
          {
            tenantId: tenant._id,
            userId: owner._id,
            name: cfg.storeName,
            slug: cfg.storeSlug,
            subdomain: cfg.subdomain,
            shortName: "Nayeem",
            description: "Premium lifestyle and electronics store by Nayeem Ahmed.",
            category: "ecommerce",
            storeType: "ecommerce",
            plan: "growth",
            billingStatus: "active",
            subscriptionStatus: "active",
            status: "active",
            published: true,
            brandColor: "#0066cc",
            accentColor: "#0f172a",
            tagline: "Quality products, trusted service",
          },
        ],
        
      );
    }

    const storeId = store._id as mongoose.Types.ObjectId;

    const settingsExists = await StoreSettingsModel.findOne({ storeId });
    if (!settingsExists) {
      await StoreSettingsModel.create(
        [
          {
            storeId,
            currencyCode: "BDT",
            currencySymbol: "৳",
            currencyPosition: "before",
            locale: "en-BD",
            timezone: "Asia/Dhaka",
            taxEnabled: true,
            taxRate: 5,
            decimalPlaces: 0,
          },
        ],
        
      );
    } else {
      await StoreSettingsModel.updateOne(
        { storeId },
        {
          $set: {
            currencyCode: "BDT",
            currencySymbol: "৳",
            currencyPosition: "before",
            locale: "en-BD",
            timezone: "Asia/Dhaka",
            taxEnabled: true,
            taxRate: 5,
            decimalPlaces: 0,
          },
        },
        
      );
    }
    await StoreContactModel.updateOne(
      { storeId },
      {
        $set: {
          businessName: cfg.storeName,
          email: cfg.ownerEmail,
          phone: "+8809612345678",
          address: "12 Gulshan Avenue",
          city: "Dhaka",
          country: "Bangladesh",
          postalCode: "1212",
        },
      },
      { upsert: true },
    );

    const categoryDocs = await CategoryModel.insertMany(
      CATEGORIES.map((cat, index) => ({
        storeId,
        name: cat.name,
        slug: cat.slug,
        description: `Shop ${cat.name.toLowerCase()} curated by ${cfg.storeName}.`,
        active: true,
        featured: index < 3,
        sortOrder: index,
        metaTitle: `${cat.name} | ${cfg.storeName}`,
        metaDescription: `Browse ${cat.name.toLowerCase()} at ${cfg.storeName}.`,
        imageUrl: imageUrl(cat.slug, 0),
      })),
      
    );

    const categoryBySlug = Object.fromEntries(categoryDocs.map((c) => [c.slug, c]));

    const productDocs: Array<{
      _id: mongoose.Types.ObjectId;
      name: string;
      slug: string;
      price: number;
      stock: number;
      isVariable: boolean;
      categorySlug: string;
    }> = [];

    for (let i = 0; i < 50; i++) {
      const category = CATEGORIES[i % CATEGORIES.length];
      const brand = BRANDS[i % BRANDS.length];
      const baseName = productTemplates(category.name, Math.floor(i / CATEGORIES.length));
      const name = `${brand} ${baseName}`;
      const slug = slugify(`${brand}-${baseName}-${i + 1}`);
      const price = pickPrice(i);
      const comparePrice = i % 3 === 0 ? Math.round(price * 1.2) : undefined;
      const isVariable = i % 4 === 0;
      const stockRoll = i % 11;
      const stock =
        stockRoll === 0 ? 0 : stockRoll === 1 ? faker.number.int({ min: 2, max: 5 }) : faker.number.int({ min: 15, max: 150 });

      const images = Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, (_, imgIdx) =>
        imageUrl(slug, imgIdx),
      );

      const shortDescription = `Premium ${category.name.toLowerCase()} from ${brand}. Fast delivery across Bangladesh.`;
      const description = `${shortDescription} Built for everyday use with dependable quality and thoughtful design. Ideal for customers who want value without compromise. Includes manufacturer warranty where applicable.`;

      const [product] = await ProductModel.create(
        [
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
            tags: [category.slug, brand.toLowerCase(), "nayeem-store", ...(i % 5 === 0 ? ["featured"] : [])],
            brand,
            vendor: brand,
            barcode: `880${faker.string.numeric(10)}`,
            stock: isVariable ? 0 : stock,
            trackInventory: true,
            lowStockThreshold: 5,
            status: stock === 0 ? "active" : "active",
            sku: `NS-${category.slug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(4, "0")}`,
            imageUrl: images[0],
            thumbnailUrl: images[0],
            galleryImageUrls: images,
            images,
            featured: i % 7 === 0,
            weight: faker.number.float({ min: 0.15, max: 2.5, fractionDigits: 2 }),
            weightUnit: "kg",
            seo: {
              title: `${name} | ${cfg.storeName}`,
              description: shortDescription,
              keywords: [brand, category.name, cfg.storeName],
            },
          },
        ],
        
      );

      productDocs.push({
        _id: product._id as mongoose.Types.ObjectId,
        name,
        slug,
        price,
        stock,
        isVariable,
        categorySlug: category.slug,
      });

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
    }

    const customers = await CustomerModel.insertMany(
      Array.from({ length: 20 }, (_, i) => {
        const first = faker.person.firstName();
        const last = faker.person.lastName();
        const city = BD_CITIES[i % BD_CITIES.length];
        return {
          storeId,
          name: `${first} ${last}`,
          email: `customer${i + 1}@nayeemstore.demo`,
          passwordHash,
          phone: `+8801${faker.string.numeric(9)}`,
          status: "active" as const,
          tags: i % 4 === 0 ? ["vip"] : [],
        };
      }),
      
    );

    const addressDocs = customers.map((customer, i) => {
        const city = BD_CITIES[i % BD_CITIES.length];
        return {
          customerId: customer._id,
          storeId,
          label: i % 2 === 0 ? "Home" : "Office",
          fullName: customer.name,
          phone: customer.phone,
          street: `${faker.number.int({ min: 1, max: 120 })} ${faker.location.street()}`,
          city: city.city,
          state: city.state,
          zip: city.zip,
          country: "Bangladesh",
          isDefault: true,
        };
      });

    await AddressModel.insertMany(addressDocs);

    const addressByCustomerId = new Map(
      addressDocs.map((address) => [String(address.customerId), address]),
    );

    const coupons = await CouponModel.insertMany(
      [
        { code: "WELCOME10", name: "Welcome 10%", type: "percentage", value: 10, status: "active" },
        { code: "SAVE500", name: "Save ৳500", type: "fixed", value: 500, status: "active" },
        { code: "FLASH15", name: "Flash Sale 15%", type: "percentage", value: 15, status: "active" },
        { code: "VIP20", name: "VIP 20%", type: "percentage", value: 20, status: "active", minimumOrderAmount: 3000 },
        { code: "FLAT1000", name: "Flat ৳1000 Off", type: "fixed", value: 1000, status: "active", minimumOrderAmount: 5000 },
        { code: "NEWYEAR25", name: "New Year 25%", type: "percentage", value: 25, status: "expired", expiresAt: new Date("2025-01-31") },
        { code: "OLDCODE", name: "Expired Promo", type: "fixed", value: 300, status: "expired", expiresAt: new Date("2024-12-31") },
        { code: "FREESHIP", name: "Free Shipping", type: "free_shipping", value: 0, status: "active" },
        { code: "SUMMER12", name: "Summer 12%", type: "percentage", value: 12, status: "active" },
        { code: "BULK800", name: "Bulk Buyer", type: "fixed", value: 800, status: "draft" },
      ].map((coupon, index) => ({
        storeId,
        ...coupon,
        description: `${coupon.name} coupon for ${cfg.storeName}`,
        usageLimit: 100 + index * 10,
        usagePerCustomer: 1,
        startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiresAt:
          coupon.expiresAt ??
          new Date(Date.now() + (index % 2 === 0 ? 60 : 15) * 24 * 60 * 60 * 1000),
      })),
      
    );

    const activeCoupons = coupons.filter((c) => c.status === "active");
    const orders = [];
    for (let i = 0; i < 50; i++) {
      const customer = customers[i % customers.length];
      const address = addressByCustomerId.get(String(customer._id));
      const itemCount = faker.number.int({ min: 1, max: 4 });
      const pickedProducts = faker.helpers.arrayElements(productDocs, itemCount);
      const items = pickedProducts.map((p) => {
        const qty = faker.number.int({ min: 1, max: 3 });
        return {
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: qty,
          image: imageUrl(p.slug, 0),
          sku: `NS-${p.categorySlug.toUpperCase().slice(0, 3)}`,
        };
      });
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal >= 2000 ? 0 : 120;
      const tax = Math.round(subtotal * 0.05);
      const useCoupon = i % 5 === 0 && activeCoupons.length;
      const coupon = useCoupon ? activeCoupons[i % activeCoupons.length] : null;
      let discount = 0;
      if (coupon) {
        discount =
          coupon.type === "percentage"
            ? Math.min(Math.round((subtotal * coupon.value) / 100), subtotal)
            : Math.min(coupon.value, subtotal);
      }
      const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
      const paymentStatus =
        status === "cancelled"
          ? "failed"
          : status === "refunded"
            ? "refunded"
            : ["pending"].includes(status)
              ? "pending"
              : "paid";
      const refundAmount = status === "refunded" ? subtotal + tax + shipping - discount : 0;
      const total = Math.max(subtotal + shipping + tax - discount - refundAmount, 0);
      const createdAt = faker.date.between({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date(),
      });

      orders.push({
        storeId,
        customerId: customer._id,
        items,
        subtotal,
        shipping,
        deliveryCharge: shipping,
        tax,
        taxRate: 5,
        discount,
        couponCode: coupon?.code ?? "",
        couponId: coupon?._id,
        refundAmount,
        total,
        status,
        paymentStatus,
        paymentMethod: i % 3 === 0 ? "cod" : "bkash",
        currencyCode: "BDT",
        orderNumber: `ORD-NAYEEM-${String(i + 1).padStart(5, "0")}`,
        shippingAddress: {
          fullName: address?.fullName ?? customer.name,
          phone: address?.phone ?? customer.phone,
          street: address?.street ?? "12 Gulshan Avenue",
          city: address?.city ?? "Dhaka",
          state: address?.state ?? "Dhaka Division",
          zip: address?.zip ?? "1212",
          country: "Bangladesh",
        },
        timeline: [
          { status: "pending", note: "Order placed", createdAt },
          ...(status !== "pending"
            ? [{ status, note: `Order ${status}`, createdAt: new Date(createdAt.getTime() + 3600000) }]
            : []),
        ],
        createdAt,
        updatedAt: createdAt,
      });
    }

    await OrderModel.insertMany(orders);

    const reviewCount = 80;
    const reviewPayloads = Array.from({ length: reviewCount }, (_, i) => {
      const product = productDocs[i % productDocs.length];
      const customer = customers[i % customers.length];
      return {
        storeId,
        productId: product._id,
        customerId: customer._id,
        customerName: customer.name,
        rating: faker.number.int({ min: 3, max: 5 }),
        title: faker.helpers.arrayElement([
          "Great quality",
          "Worth the price",
          "Fast delivery",
          "Exactly as described",
          "Highly recommended",
        ]),
        body: faker.lorem.sentences({ min: 1, max: 2 }),
        status: i % 9 === 0 ? "pending" : "approved",
        verifiedPurchase: i % 2 === 0,
      };
    });
    await ReviewModel.insertMany(reviewPayloads);

    await seedAnalytics({ storeId, tenantId: tenant._id as mongoose.Types.ObjectId, orders, productDocs });

    for (const customer of customers) {
      await syncCustomerOrderStats(String(storeId), String(customer._id));
    }

    console.log(`[seed] Nayeem Store seeded: ${productDocs.length} products, ${customers.length} customers, ${orders.length} orders`);
    return { storeId: String(storeId), skipped: false };
  } catch (error) {
    throw error;
  } finally {
  }
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
    : { name: "Color", values: COLORS.slice(0, 3) };
  const secondaryOption = isElectronics
    ? { name: "Color", values: COLORS.slice(0, 2) }
    : { name: "Size", values: SIZES.slice(0, 3) };

  const [primaryOpt] = await ProductOptionModel.create(
    [{ storeId, productId, name: primaryOption.name, position: 0, displayType: "button" }],
    
  );
  const [secondaryOpt] = await ProductOptionModel.create(
    [{ storeId, productId, name: secondaryOption.name, position: 1, displayType: "button" }],
    
  );

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
      const variantPrice = price + faker.number.int({ min: 0, max: 700 });
      const variantStock = faker.number.int({ min: 0, max: 35 });
      totalStock += variantStock;

      const [variant] = await ProductVariantModel.create(
        [
          {
            storeId,
            productId,
            title,
            sku: `VAR-${slugify(product.slug)}-${slugify(`${primary.value}-${secondary.value}`)}`,
            barcode: `880${faker.string.numeric(9)}`,
            status: variantStock === 0 ? "out_of_stock" : "active",
            isDefault: variantIds.length === 0,
            weight: faker.number.float({ min: 0.1, max: 1.5, fractionDigits: 2 }),
          },
        ],
        
      );

      variantIds.push(variant._id as mongoose.Types.ObjectId);
      await VariantPriceModel.create(
        [
          {
            storeId,
            productId,
            variantId: variant._id,
            sellingPrice: variantPrice,
            comparePrice: comparePrice ? comparePrice + faker.number.int({ min: 100, max: 400 }) : undefined,
            costPrice: Math.round(variantPrice * 0.62),
          },
        ],
        
      );
      await VariantInventoryModel.create(
        [
          {
            storeId,
            productId,
            variantId: variant._id,
            quantity: variantStock,
            lowStockThreshold: 5,
          },
        ],
        
      );
      await VariantImageModel.insertMany(
        images.slice(0, 3).map((url, position) => ({
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
        sku: `VAR-${slugify(product.slug)}-${slugify(`${primary.value}-${secondary.value}`)}`,
        imageUrl: images[0],
        enabled: true,
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

async function seedAnalytics({
  storeId,
  tenantId,
  orders,
  productDocs,
}: {
  storeId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  orders: Array<{ total: number; createdAt: Date; status: string }>;
  productDocs: Array<{ _id: mongoose.Types.ObjectId; name: string }>;
}) {
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    if (["cancelled", "refunded"].includes(order.status)) continue;
    const key = order.createdAt.toISOString().slice(0, 10);
    const current = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    current.revenue += order.total;
    current.orders += 1;
    dailyMap.set(key, current);
  }

  const dailyDocs = [];
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - dayOffset);
    const key = date.toISOString().slice(0, 10);
    const agg = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    const visits = faker.number.int({ min: 120, max: 680 });
    dailyDocs.push({
      storeId,
      tenantId,
      date,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      dayOfWeek: date.getDay(),
      totalVisits: visits,
      uniqueVisitors: Math.round(visits * 0.72),
      returningVisitors: Math.round(visits * 0.28),
      newVisitors: Math.round(visits * 0.44),
      totalPageViews: visits * faker.number.int({ min: 2, max: 5 }),
      totalSessions: Math.round(visits * 0.9),
      bouncedSessions: Math.round(visits * 0.35),
      bounceRate: 35,
      avgSessionDuration: faker.number.int({ min: 90, max: 320 }),
      pagesPerSession: faker.number.float({ min: 2.1, max: 4.8, fractionDigits: 1 }),
      desktopCount: Math.round(visits * 0.35),
      mobileCount: Math.round(visits * 0.58),
      tabletCount: Math.round(visits * 0.07),
      trafficSources: {
        direct: Math.round(visits * 0.3),
        search: Math.round(visits * 0.35),
        social: Math.round(visits * 0.15),
        email: Math.round(visits * 0.05),
        referral: Math.round(visits * 0.1),
        qr: Math.round(visits * 0.02),
        utm: Math.round(visits * 0.02),
        other: Math.round(visits * 0.01),
      },
      topProducts: faker.helpers.arrayElements(productDocs, 5).map((p) => ({
        productId: p._id,
        name: p.name,
        views: faker.number.int({ min: 20, max: 200 }),
        addedToCart: faker.number.int({ min: 5, max: 40 }),
        purchased: faker.number.int({ min: 1, max: 15 }),
      })),
      countries: [
        { code: "BD", count: Math.round(visits * 0.92) },
        { code: "US", count: Math.round(visits * 0.04) },
        { code: "GB", count: Math.round(visits * 0.04) },
      ],
    });
  }
  await DailyAnalyticModel.insertMany(dailyDocs);

  const monthlyDocs = [];
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - monthOffset);
    const visits = faker.number.int({ min: 3500, max: 12000 });
    monthlyDocs.push({
      storeId,
      tenantId,
      date,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      totalVisits: visits,
      uniqueVisitors: Math.round(visits * 0.68),
      returningVisitors: Math.round(visits * 0.3),
      newVisitors: Math.round(visits * 0.4),
      totalPageViews: visits * 3,
      totalSessions: Math.round(visits * 0.88),
      bouncedSessions: Math.round(visits * 0.32),
      bounceRate: 32,
      avgSessionDuration: faker.number.int({ min: 120, max: 360 }),
      pagesPerSession: 3.2,
      desktopCount: Math.round(visits * 0.34),
      mobileCount: Math.round(visits * 0.57),
      tabletCount: Math.round(visits * 0.09),
      trafficSources: {
        direct: Math.round(visits * 0.28),
        search: Math.round(visits * 0.36),
        social: Math.round(visits * 0.14),
        email: Math.round(visits * 0.06),
        referral: Math.round(visits * 0.1),
        qr: Math.round(visits * 0.02),
        utm: Math.round(visits * 0.03),
        other: Math.round(visits * 0.01),
      },
      topProducts: faker.helpers.arrayElements(productDocs, 8).map((p) => ({
        productId: p._id,
        name: p.name,
        views: faker.number.int({ min: 200, max: 1800 }),
      })),
      countries: [{ code: "BD", count: Math.round(visits * 0.9) }],
    });
  }
  await MonthlyAnalyticModel.insertMany(monthlyDocs);
}
