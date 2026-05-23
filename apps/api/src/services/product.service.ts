import { connectDatabase } from "../config/database.js";
import { ProductModel } from "../models/product.model.js";
import { createProductSchema, updateProductSchema } from "../validators/product.validator.js";

export async function getProducts(storeId: string) {
  await connectDatabase();
  const products = await ProductModel.find({ storeId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { products } };
}

export async function getProduct(productId: string) {
  await connectDatabase();
  const product = await ProductModel.findById(productId).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, data: { product } };
}

export async function createProduct(storeId: string, payload: unknown) {
  const parsed = createProductSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid product data" };

  await connectDatabase();

  const existing = await ProductModel.findOne({ storeId, slug: parsed.data.slug });
  if (existing) return { ok: false as const, message: "Product slug already exists in this store" };

  const product = await ProductModel.create({ storeId, ...parsed.data });
  return { ok: true as const, data: { product: product.toObject() } };
}

export async function updateProduct(productId: string, storeId: string, payload: unknown) {
  const parsed = updateProductSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid product data" };

  await connectDatabase();
  const product = await ProductModel.findOneAndUpdate(
    { _id: productId, storeId },
    { $set: parsed.data },
    { new: true }
  ).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, data: { product } };
}

export async function deleteProduct(productId: string, storeId: string) {
  await connectDatabase();
  const product = await ProductModel.findOneAndDelete({ _id: productId, storeId }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, message: "Product deleted" };
}

export async function duplicateProduct(productId: string, storeId: string) {
  await connectDatabase();
  const original: any = await ProductModel.findOne({ _id: productId, storeId }).lean();
  if (!original) return { ok: false as const, message: "Product not found" };

  const dup = await ProductModel.create({
    storeId,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now()}`,
    description: original.description,
    price: original.price,
    comparePrice: original.comparePrice,
    category: original.category,
    stock: original.stock,
    status: "inactive",
    sku: original.sku ? `${original.sku}-COPY` : "",
    images: original.images,
    featured: false
  });

  return { ok: true as const, data: { product: dup.toObject() } };
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

  const products = demoProducts.map((p) => ({ ...p, storeId, description: p.description ?? "", status: "active" as const, featured: false, images: [] }));
  await ProductModel.insertMany(products);
  console.log(`  ✔ Seeded ${products.length} demo products for store ${storeId}`);
}
