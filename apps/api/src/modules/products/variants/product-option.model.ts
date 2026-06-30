import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productOptionSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    name: { type: String, required: true, trim: true },
    position: { type: Number, default: 0 },
    displayType: {
      type: String,
      enum: ["dropdown", "button", "color_swatch", "image_swatch"],
      default: "button",
    },
  },
  { timestamps: true }
);

productOptionSchema.index({ productId: 1, name: 1 }, { unique: true });

export type ProductOptionDocument = InferSchemaType<typeof productOptionSchema>;
export const ProductOptionModel = models.ProductOption ?? model("ProductOption", productOptionSchema);
