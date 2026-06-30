import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const variantInventorySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, unique: true },
    quantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    trackInventory: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type VariantInventoryDocument = InferSchemaType<typeof variantInventorySchema>;
export const VariantInventoryModel =
  models.VariantInventory ?? model("VariantInventory", variantInventorySchema);
