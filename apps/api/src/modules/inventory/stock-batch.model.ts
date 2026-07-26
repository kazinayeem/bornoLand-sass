import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const stockBatchSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", default: null },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", default: null },
    batchNumber: { type: String, required: true, trim: true },
    lotNumber: { type: String, default: "", trim: true },
    purchaseDate: { type: Date, default: Date.now },
    buyCost: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, default: null },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder", default: null },
    status: { type: String, enum: ["active", "depleted", "expired"], default: "active" },
  },
  { timestamps: true }
);

stockBatchSchema.index({ storeId: 1, productId: 1, status: 1, purchaseDate: 1 });
stockBatchSchema.index({ storeId: 1, batchNumber: 1 });

export type StockBatchDocument = InferSchemaType<typeof stockBatchSchema>;
export const StockBatchModel = models.StockBatch ?? model("StockBatch", stockBatchSchema);
