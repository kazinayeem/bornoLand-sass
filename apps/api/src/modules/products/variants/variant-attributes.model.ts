import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const variantAttributesSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, index: true },
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

variantAttributesSchema.index({ variantId: 1, key: 1 }, { unique: true });

export type VariantAttributesDocument = InferSchemaType<typeof variantAttributesSchema>;
export const VariantAttributesModel =
  models.VariantAttributes ?? model("VariantAttributes", variantAttributesSchema);
