import { connectDatabase } from "../apps/api/src/common/database/connection.js";
import { StoreModel } from "../apps/api/src/modules/stores/store.model.js";
import { ProductModel } from "../apps/api/src/modules/products/product.model.js";
import { CategoryModel } from "../apps/api/src/modules/categories/category.model.js";
import { SupplierModel } from "../apps/api/src/modules/inventory/supplier.model.js";
import { WarehouseModel } from "../apps/api/src/modules/inventory/warehouse.model.js";
import { BrandModel } from "../apps/api/src/modules/brands/brand.model.js";

async function inspect() {
  await connectDatabase();
  const store = await StoreModel.findOne({ slug: "nayeem" }).lean();
  if (!store) {
    console.log("Store 'nayeem' NOT found!");
    process.exit(1);
  }

  console.log("=== TARGET TENANT RESOLUTION ===");
  console.log("Store Name:", store.name);
  console.log("Store Slug:", store.slug);
  console.log("Store ID:", store._id.toString());
  console.log("Store Status:", store.status);

  const existingProducts = await ProductModel.countDocuments({ storeId: store._id });
  const seededNayeem = await ProductModel.countDocuments({ storeId: store._id, sku: { $regex: "^SEED-NAYEEM-" } });
  const oldSeedNay = await ProductModel.countDocuments({ storeId: store._id, sku: { $regex: "^NAY-" } });

  console.log("Existing Product Count (Total):", existingProducts);
  console.log("Existing SEED-NAYEEM-* Count:", seededNayeem);
  console.log("Existing NAY-* Count:", oldSeedNay);

  const categories = await CategoryModel.find({ storeId: store._id }).select("name slug").lean();
  console.log(`Existing Categories (${categories.length}):`, categories.map((c: any) => `${c.name} (${c.slug})`));

  const suppliers = await SupplierModel.find({ storeId: store._id }).select("name code").lean();
  console.log(`Existing Suppliers (${suppliers.length}):`, suppliers.map((s: any) => `${s.name} (${s.code})`));

  const warehouses = await WarehouseModel.find({ storeId: store._id }).select("name isDefault").lean();
  console.log(`Existing Warehouses (${warehouses.length}):`, warehouses.map((w: any) => `${w.name} (default: ${w.isDefault})`));

  const brands = await BrandModel.find({ storeId: store._id }).select("name slug").lean();
  console.log(`Existing Brands (${brands.length}):`, brands.map((b: any) => `${b.name} (${b.slug})`));

  process.exit(0);
}

inspect().catch((err) => {
  console.error("Inspect failed:", err);
  process.exit(1);
});
