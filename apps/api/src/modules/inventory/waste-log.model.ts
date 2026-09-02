import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const wasteLogSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", default: null, index: true },
    branchId: { type: Schema.Types.ObjectId, default: null, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: "StockBatch", default: null },

    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },

    reason: {
      type: String,
      enum: [
        "damaged",
        "expired",
        "broken",
        "production_waste",
        "packaging_waste",
        "handling_loss",
        "warehouse_loss",
        "pos_discrepancy",
        "returned_damaged",
        "stock_adjustment",
        "other",
      ],
      default: "damaged",
      required: true,
      index: true,
    },
    reference: { type: String, default: "" },
    notes: { type: String, default: "" },

    reportedBy: { type: String, default: "system" },
    reportedById: { type: Schema.Types.ObjectId, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    approvedBy: { type: String, default: "" },
    approvedById: { type: Schema.Types.ObjectId, default: null },
    approvedAt: { type: Date, default: null },
    journalEntryId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

wasteLogSchema.index({ storeId: 1, createdAt: -1 });
wasteLogSchema.index({ storeId: 1, reason: 1, createdAt: -1 });
wasteLogSchema.index({ storeId: 1, productId: 1, createdAt: -1 });

export type WasteLogDocument = InferSchemaType<typeof wasteLogSchema>;
export const WasteLogModel = models.WasteLog ?? model("WasteLog", wasteLogSchema);
