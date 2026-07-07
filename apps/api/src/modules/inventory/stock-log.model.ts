import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const stockLogSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null, index: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    quantityChange: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["manual_adjust", "order_placed", "order_refunded", "order_cancelled", "import", "bulk_update", "product_edit", "variant_edit", "restock", "return", "damage", "expired", "other"],
      default: "manual_adjust",
    },
    note: { type: String, default: "" },
    updatedBy: { type: String, default: "system" },
    updatedById: { type: Schema.Types.ObjectId, default: null },
    source: { type: String, enum: ["manual", "order", "import", "bulk", "api", "system"], default: "manual" },
    reference: { type: String, default: "" },
    referenceId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

stockLogSchema.index({ storeId: 1, createdAt: -1 });
stockLogSchema.index({ productId: 1, createdAt: -1 });
stockLogSchema.index({ variantId: 1, createdAt: -1 });
stockLogSchema.index({ storeId: 1, reason: 1, createdAt: -1 });

export type StockLogDocument = InferSchemaType<typeof stockLogSchema>;
export const StockLogModel = models.StockLog ?? model("StockLog", stockLogSchema);
