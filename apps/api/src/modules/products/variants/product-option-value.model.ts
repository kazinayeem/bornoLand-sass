import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productOptionValueSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    optionId: { type: Schema.Types.ObjectId, ref: "ProductOption", required: true, index: true },
    value: { type: String, required: true, trim: true },
    position: { type: Number, default: 0 },
    colorHex: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

productOptionValueSchema.index({ optionId: 1, value: 1 }, { unique: true });

export type ProductOptionValueDocument = InferSchemaType<typeof productOptionValueSchema>;
export const ProductOptionValueModel =
  models.ProductOptionValue ?? model("ProductOptionValue", productOptionValueSchema);
