import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const variantImageSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, index: true },
    mediaId: { type: Schema.Types.ObjectId, ref: "MediaFile", default: null },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    position: { type: Number, default: 0 },
    alt: { type: String, default: "" },
  },
  { timestamps: true }
);

variantImageSchema.index({ variantId: 1, position: 1 });

export type VariantImageDocument = InferSchemaType<typeof variantImageSchema>;
export const VariantImageModel = models.VariantImage ?? model("VariantImage", variantImageSchema);
