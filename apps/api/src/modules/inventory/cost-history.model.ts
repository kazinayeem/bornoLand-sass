import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const costHistorySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    previousCost: { type: Number, required: true },
    newCost: { type: Number, required: true },
    averageCost: { type: Number, default: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", default: null },
    batchId: { type: Schema.Types.ObjectId, ref: "StockBatch", default: null },
    reason: { type: String, default: "" },
    createdBy: { type: String, default: "system" },
    createdById: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

costHistorySchema.index({ storeId: 1, productId: 1, createdAt: -1 });

export type CostHistoryDocument = InferSchemaType<typeof costHistorySchema>;
export const CostHistoryModel = models.CostHistory ?? model("CostHistory", costHistorySchema);
