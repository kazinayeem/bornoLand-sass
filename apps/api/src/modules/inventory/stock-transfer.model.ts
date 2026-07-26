import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const stockTransferItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const stockTransferSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    fromWarehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    toWarehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    transferNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
    items: { type: [stockTransferItemSchema], default: [] },
    notes: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

stockTransferSchema.index({ storeId: 1, transferNumber: 1 }, { unique: true });
stockTransferSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export type StockTransferDocument = InferSchemaType<typeof stockTransferSchema>;
export const StockTransferModel =
  models.StockTransfer ?? model("StockTransfer", stockTransferSchema);
