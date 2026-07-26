import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const stockLogSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", default: null, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: "StockBatch", default: null, index: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    /** Alias of previousStock for ERP consumers */
    beforeQuantity: { type: Number, default: null },
    /** Alias of newStock for ERP consumers */
    afterQuantity: { type: Number, default: null },
    quantityChange: { type: Number, required: true },
    reason: {
      type: String,
      enum: [
        "manual_adjust",
        "order_placed",
        "order_refunded",
        "order_cancelled",
        "import",
        "bulk_update",
        "product_edit",
        "variant_edit",
        "restock",
        "return",
        "damage",
        "expired",
        "other",
        "purchase",
        "sale",
        "transfer",
        "transfer_in",
        "transfer_out",
        "adjustment",
        "system_update",
        "fifo_allocate",
        "warehouse_transfer",
      ],
      default: "manual_adjust",
    },
    note: { type: String, default: "" },
    updatedBy: { type: String, default: "system" },
    updatedById: { type: Schema.Types.ObjectId, default: null },
    source: { type: String, enum: ["manual", "order", "import", "bulk", "api", "system"], default: "manual" },
    reference: { type: String, default: "" },
    referenceId: { type: Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    device: { type: String, default: "" },
  },
  { timestamps: true }
);

stockLogSchema.index({ storeId: 1, createdAt: -1 });
stockLogSchema.index({ productId: 1, createdAt: -1 });
stockLogSchema.index({ variantId: 1, createdAt: -1 });
stockLogSchema.index({ storeId: 1, reason: 1, createdAt: -1 });
stockLogSchema.index({ storeId: 1, warehouseId: 1, createdAt: -1 });

export type StockLogDocument = InferSchemaType<typeof stockLogSchema>;
export const StockLogModel = models.StockLog ?? model("StockLog", stockLogSchema);
