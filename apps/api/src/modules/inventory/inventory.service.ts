import { connectDatabase } from "../../common/database/connection.js";
import { ProductModel } from "../products/product.model.js";
import { StoreSettingsModel } from "../stores/store-settings.model.js";
import { loadProductVariants } from "../products/variants/variant.service.js";
import { VariantInventoryModel } from "../products/variants/variant-inventory.model.js";

export async function getInventoryOverview(storeId: string) {
  await connectDatabase();
  const settings = (await StoreSettingsModel.findOne({ storeId }).lean()) as { lowStockAlertEnabled?: boolean } | null;
  const thresholdDefault = 5;

  const products = await ProductModel.find({ storeId, status: { $in: ["active", "draft"] } })
    .select("name slug sku stock lowStockThreshold trackInventory status productType")
    .lean();

  const rows: Array<Record<string, unknown>> = [];

  for (const product of products) {
    const productId = String(product._id);
    const variants = await loadProductVariants(productId);
    const threshold = product.lowStockThreshold ?? thresholdDefault;

    if (variants.length > 0) {
      for (const variant of variants) {
        if (!variant.enabled) continue;
        rows.push({
          productId: product._id,
          variantId: variant._id,
          name: product.name,
          variantTitle: variant.title,
          sku: variant.sku || product.sku,
          stock: variant.stock,
          threshold: variant.lowStockThreshold ?? threshold,
          lowStock: variant.stock <= (variant.lowStockThreshold ?? threshold),
          status: variant.status,
        });
      }
    } else if (product.trackInventory !== false) {
      const stock = product.stock ?? 0;
      rows.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        stock,
        threshold,
        lowStock: stock <= threshold,
        status: product.status,
      });
    }
  }

  const lowStock = rows.filter((i) => i.lowStock);
  const outOfStock = rows.filter((i) => (i.stock as number) <= 0);

  return {
    ok: true as const,
    data: {
      items: rows,
      summary: {
        totalSkus: rows.length,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        alertsEnabled: settings?.lowStockAlertEnabled ?? true,
      },
      lowStock,
      outOfStock,
    },
  };
}

export async function adjustStock(
  storeId: string,
  productId: string,
  payload: { quantity: number; variantId?: string; reason?: string }
) {
  await connectDatabase();
  const product = await ProductModel.findOne({ _id: productId, storeId });
  if (!product) return { ok: false as const, message: "Product not found" };

  if (payload.variantId) {
    const inv = await VariantInventoryModel.findOne({
      variantId: payload.variantId,
      storeId,
      productId,
    });
    if (!inv) return { ok: false as const, message: "Variant not found" };
    inv.quantity = Math.max(0, inv.quantity + payload.quantity);
    await inv.save();
    return { ok: true as const, data: { stock: inv.quantity } };
  }

  product.stock = Math.max(0, (product.stock ?? 0) + payload.quantity);
  await product.save();
  return { ok: true as const, data: { stock: product.stock } };
}
