import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import mongoose from "mongoose";
import { connectDatabase } from "./common/database/connection.js";
import { deleteStore } from "./modules/stores/store.service.js";
import { StoreModel } from "./models/store.model.js";
import { ProductModel } from "./models/product.model.js";
import { CategoryModel } from "./models/category.model.js";
import { StockLogModel } from "./modules/inventory/stock-log.model.js";
import { CustomerModel } from "./models/customer.model.js";
import { OrderModel } from "./models/order.model.js";
import { ReviewModel } from "./models/review.model.js";
import { CouponModel } from "./models/coupon.model.js";
import { StorePageModel } from "./modules/pages/store-page.model.js";
import { NavigationModel } from "./modules/navigation/navigation.model.js";
import { BuilderTemplateModel } from "./modules/builder/builder-template.model.js";
import { StoreSettingsModel } from "./models/store-settings.model.js";
import { MediaFileModel } from "./models/media-file.model.js";
import { getUploadRoot } from "./modules/media/providers/local-storage.provider.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

async function run() {
  console.log("=== Verification Script Started ===");
  await connectDatabase();

  const dummyStoreId = new mongoose.Types.ObjectId();
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyTenantId = new mongoose.Types.ObjectId();
  const storeSlug = "test-verification-store-" + Date.now();

  console.log(`Creating dummy store with slug: "${storeSlug}"`);

  // Create store document
  const store = await StoreModel.create({
    _id: dummyStoreId,
    userId: dummyUserId,
    tenantId: dummyTenantId,
    name: "Verification Test Store",
    slug: storeSlug,
    status: "active",
    plan: "free",
  });

  // Create dummy records in related collections
  console.log("Creating dummy database records...");
  await ProductModel.create({ storeId: dummyStoreId, name: "Test Product", slug: "test-product", price: 10, sku: "TP-1" });
  await CategoryModel.create({ storeId: dummyStoreId, name: "Test Category", slug: "test-category" });
  await StockLogModel.create({
    storeId: dummyStoreId,
    productId: new mongoose.Types.ObjectId(),
    previousStock: 0,
    newStock: 10,
    quantityChange: 10,
    reason: "manual_adjust",
  });
  await CustomerModel.create({ storeId: dummyStoreId, name: "Test Customer", email: `test-${Date.now()}@test.com`, passwordHash: "dummy-hash" });
  await OrderModel.create({
    storeId: dummyStoreId,
    customerId: new mongoose.Types.ObjectId(),
    orderNumber: "ORD-" + Date.now(),
    subtotal: 10,
    total: 10,
    shippingAddress: {
      fullName: "Test Customer",
      phone: "1234567890",
      street: "123 Main St",
      city: "Test City"
    }
  });
  await ReviewModel.create({ storeId: dummyStoreId, productId: new mongoose.Types.ObjectId(), rating: 5, comment: "Great!" });
  await CouponModel.create({ storeId: dummyStoreId, name: "Test Coupon", code: "TEST50", discountType: "percentage", discountValue: 50 });
  await StorePageModel.create({ storeId: dummyStoreId, title: "Test Page", slug: "test-page" });
  await NavigationModel.create({ storeId: dummyStoreId, name: "Main Menu", label: "Main Menu", key: "primary" });
  await BuilderTemplateModel.create({ storeId: dummyStoreId, name: "Builder Layout", slug: "builder-layout" });
  await StoreSettingsModel.create({ storeId: dummyStoreId });
  await MediaFileModel.create({
    storeId: dummyStoreId,
    originalName: "test.jpg",
    storedName: "test.jpg",
    mimeType: "image/jpeg",
    size: 100,
    storagePath: "test",
    publicUrl: "http://localhost/test.jpg",
  });

  // Create physical uploads directory
  const uploadRoot = getUploadRoot();
  const storeUploadDir = path.resolve(uploadRoot, "stores", storeSlug);
  await fs.mkdir(storeUploadDir, { recursive: true });
  await fs.writeFile(path.join(storeUploadDir, "dummy-image.jpg"), "fake-binary-data");
  console.log(`Created physical directory at: ${storeUploadDir}`);

  // Check that files exist before deletion
  const dirExistsBefore = await fs.access(storeUploadDir).then(() => true).catch(() => false);
  console.log(`Directory exists before deletion: ${dirExistsBefore}`);

  // Run deleteStore
  console.log("Triggering deleteStore...");
  const result = await deleteStore(dummyStoreId.toString(), dummyUserId.toString(), (step, status, error) => {
    console.log(`Step progress: [${step}] -> ${status} ${error ? `(Error: ${error})` : ""}`);
  });

  console.log("Delete Store Result:", result);

  // Assertions
  const storeExistsAfter = await StoreModel.findById(dummyStoreId);
  const productsCount = await ProductModel.countDocuments({ storeId: dummyStoreId });
  const categoriesCount = await CategoryModel.countDocuments({ storeId: dummyStoreId });
  const mediaCount = await MediaFileModel.countDocuments({ storeId: dummyStoreId });
  const settingsCount = await StoreSettingsModel.countDocuments({ storeId: dummyStoreId });
  // Wait a short moment for background filesystem deletion to finish
  await new Promise((resolve) => setTimeout(resolve, 100));
  const dirExistsAfter = await fs.access(storeUploadDir).then(() => true).catch(() => false);

  console.log("\n=== POST-DELETE VERIFICATION ===");
  console.log(`Store document removed: ${storeExistsAfter === null}`);
  console.log(`Products removed: ${productsCount === 0}`);
  console.log(`Categories removed: ${categoriesCount === 0}`);
  console.log(`Media records removed: ${mediaCount === 0}`);
  console.log(`Settings removed: ${settingsCount === 0}`);
  console.log(`Physical directory removed: ${!dirExistsAfter}`);

  if (
    storeExistsAfter === null &&
    productsCount === 0 &&
    categoriesCount === 0 &&
    mediaCount === 0 &&
    settingsCount === 0 &&
    !dirExistsAfter
  ) {
    console.log("\n✓ All checks passed successfully!");
  } else {
    console.error("\n✗ Some checks failed!");
    process.exit(1);
  }

  // Next, let's test that physical file failure does NOT roll back database changes
  console.log("\n=== TESTING THAT FILESYSTEM FAILURE DOES NOT ROLL BACK DATABASE ===");
  const errorStoreId = new mongoose.Types.ObjectId();
  const errorStoreSlug = "test-error-store-" + Date.now();

  await StoreModel.create({
    _id: errorStoreId,
    userId: dummyUserId,
    tenantId: dummyTenantId,
    name: "Error Test Store",
    slug: errorStoreSlug,
    status: "active",
    plan: "free",
  });

  await ProductModel.create({ storeId: errorStoreId, name: "Error Product", slug: "error-product", price: 20, sku: "EP-1" });

  // Use an invalid slug to trigger filesystem deletion failure
  await StoreModel.findByIdAndUpdate(errorStoreId, { slug: "../invalid-slug" });

  console.log("Triggering deleteStore for error test...");
  const errorResult = await deleteStore(errorStoreId.toString(), dummyUserId.toString());
  console.log("Error Delete Result:", errorResult);

  // Wait a moment for background cleanup to run
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Assertions
  const errorStoreExists = await StoreModel.findById(errorStoreId);
  const errorProductsCount = await ProductModel.countDocuments({ storeId: errorStoreId });

  console.log(`Database Store document removed: ${errorStoreExists === null}`);
  console.log(`Database Product document removed: ${errorProductsCount === 0}`);

  if (errorStoreExists === null && errorProductsCount === 0) {
    console.log("\n✓ Transaction committed successfully despite filesystem failure!");
  } else {
    console.error("\n✗ Error test failed! Data was not deleted.");
    process.exit(1);
  }

  // Cleanup the error test store manually (it's already deleted by the service, but just in case)
  await StoreModel.deleteOne({ _id: errorStoreId });
  await ProductModel.deleteMany({ storeId: errorStoreId });

  process.exit(0);
}

run().catch((err) => {
  console.error("Verification script failed with error:", err);
  process.exit(1);
});
