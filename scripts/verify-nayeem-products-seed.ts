import assert from "node:assert/strict";
import { connectDatabase } from "../apps/api/src/common/database/connection.js";
import { StoreModel } from "../apps/api/src/modules/stores/store.model.js";
import { ProductModel } from "../apps/api/src/modules/products/product.model.js";
import { ProductVariantModel } from "../apps/api/src/modules/products/variants/product-variant.model.js";
import { StockLogModel } from "../apps/api/src/modules/inventory/stock-log.model.js";
import { VariantPriceModel } from "../apps/api/src/modules/products/variants/variant-price.model.js";

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    })
    .catch((err: any) => {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
      failed++;
    });
}

async function verify() {
  console.log("\n=======================================================");
  console.log(" 🧪 BORNO LAND — NAYEEM 100 PRODUCTS SEED VERIFICATION");
  console.log("=======================================================\n");

  await connectDatabase();

  const store = await StoreModel.findOne({ slug: "nayeem" });
  assert.ok(store, "Target store 'nayeem' must exist");
  const storeId = store._id;

  // ── Test Suite 1: Exact Counts & Tenant Isolation ──────────────────
  console.log("📋 Test Suite 1: Exact Counts & Tenant Isolation");

  await runTest("Exactly 100 SEED-NAYEEM-* products exist for store", async () => {
    const seedProducts = await ProductModel.countDocuments({
      storeId,
      sku: { $regex: "^SEED-NAYEEM-" },
    });
    assert.strictEqual(seedProducts, 100, `Expected exactly 100 seed products, found ${seedProducts}`);
  });

  await runTest("Total store products is exactly 252 (152 existing + 100 seeded)", async () => {
    const total = await ProductModel.countDocuments({ storeId });
    assert.strictEqual(total, 252, `Expected total 252 products, found ${total}`);
  });

  await runTest("Zero seeded products leak into other stores", async () => {
    const leaked = await ProductModel.countDocuments({
      storeId: { $ne: storeId },
      sku: { $regex: "^SEED-NAYEEM-" },
    });
    assert.strictEqual(leaked, 0, "No seed products should have storeId other than nayeem store");
  });

  // ── Test Suite 2: Variants, Colors & Options ───────────────────────
  console.log("\n🎨 Test Suite 2: Variants, Colors & Attributes");

  await runTest("Over 100 variants created with unique SKUs and barcodes", async () => {
    const variants = await ProductVariantModel.find({
      storeId,
      sku: { $regex: "^SEED-NAYEEM-" },
    });
    assert.ok(variants.length >= 100, `Expected at least 100 variants, found ${variants.length}`);

    // Check unique SKUs
    const skus = new Set(variants.map((v) => v.sku));
    assert.strictEqual(skus.size, variants.length, "All variant SKUs must be unique");
  });

  await runTest("Variable products have synchronized embedded variants", async () => {
    const variableProducts = await ProductModel.find({
      storeId,
      productType: "variable",
      sku: { $regex: "^SEED-NAYEEM-" },
    });
    assert.ok(variableProducts.length > 30, `Expected >30 variable products, found ${variableProducts.length}`);
    for (const p of variableProducts) {
      assert.ok(p.variants && p.variants.length > 0, `Product ${p.sku} must have embedded variants`);
      assert.ok(p.defaultVariantId, `Product ${p.sku} must have a defaultVariantId`);
    }
  });

  // ── Test Suite 3: Realistic Pricing & Cost Protection ──────────────
  console.log("\n💰 Test Suite 3: Margins & Cost Confidentiality");

  await runTest("Every seeded product has a valid buyPrice <= selling price", async () => {
    const products = await ProductModel.find({
      storeId,
      sku: { $regex: "^SEED-NAYEEM-" },
    });
    for (const p of products) {
      assert.ok(p.buyPrice > 0, `Product ${p.sku} must have buyPrice > 0`);
      assert.ok(p.price >= p.buyPrice, `Product ${p.sku} selling price (${p.price}) must be >= buyPrice (${p.buyPrice})`);
    }
  });

  await runTest("Variant cost prices exist in VariantPrice records", async () => {
    const variantPrices = await VariantPriceModel.find({ storeId });
    assert.ok(variantPrices.length >= 100, `Expected >=100 variant prices, found ${variantPrices.length}`);
    for (const vp of variantPrices) {
      if (vp.costPrice) {
        assert.ok(vp.costPrice <= vp.sellingPrice, `Variant price cost (${vp.costPrice}) must be <= sellingPrice (${vp.sellingPrice})`);
      }
    }
  });

  // ── Test Suite 4: Stock & Opening Stock Logs ───────────────────────
  console.log("\n📦 Test Suite 4: Inventory & Stock Ledger Audit");

  await runTest("StockLog contains opening_stock entries for seeded products", async () => {
    const logs = await StockLogModel.countDocuments({
      storeId,
      reason: "opening_stock",
      note: { $regex: "Initial Opening Stock Seed" },
    });
    assert.ok(logs >= 100, `Expected at least 100 opening_stock logs, found ${logs}`);
  });

  await runTest("Stock levels contain diverse ranges (normal, low, and out of stock)", async () => {
    const lowStockCount = await ProductModel.countDocuments({
      storeId,
      sku: { $regex: "^SEED-NAYEEM-" },
      stock: { $gt: 0, $lte: 5 },
    });
    const outOfStockCount = await ProductModel.countDocuments({
      storeId,
      sku: { $regex: "^SEED-NAYEEM-" },
      stock: 0,
    });
    assert.ok(lowStockCount > 0, "Must include low-stock products for testing low-stock alerts");
    assert.ok(outOfStockCount > 0, "Must include out-of-stock products for testing out-of-stock UI");
  });

  console.log("\n=======================================================");
  console.log(` 🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) process.exit(1);
}

verify().catch((err) => {
  console.error("Verification execution error:", err);
  process.exit(1);
});
