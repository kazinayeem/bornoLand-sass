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
    { name: "Premium Perfume", slug: "premium-perfume", price: 79.99, comparePrice: 99.99, category: "Beauty", stock: 90, sku: "PRF-001", description: "Long-lasting premium fragrance with notes of bergamot, cedar, and amber." }
  ];

  const products = demoProducts.map((p) => ({ ...p, storeId, description: p.description ?? "", status: "active" as const, featured: false, images: [] }));
  await ProductModel.insertMany(products);
  console.log(`  ✔ Seeded ${products.length} demo products for store ${storeId}`);
}
