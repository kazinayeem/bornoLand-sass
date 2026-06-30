import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const variantPriceSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, unique: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    wholesalePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export type VariantPriceDocument = InferSchemaType<typeof variantPriceSchema>;
export const VariantPriceModel = models.VariantPrice ?? model("VariantPrice", variantPriceSchema);
