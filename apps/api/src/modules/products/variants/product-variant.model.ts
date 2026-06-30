import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const dimensionsSchema = new Schema(
  {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, default: "cm" },
  },
  { _id: false }
);

const seoSchema = new Schema(
  {
    slug: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const productVariantSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    title: { type: String, required: true, trim: true },
    optionValueIds: [{ type: Schema.Types.ObjectId, ref: "ProductOptionValue" }],
    sku: { type: String, default: "", trim: true, index: true },
    barcode: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["active", "draft", "out_of_stock", "archived", "hidden"],
      default: "active",
    },
    isDefault: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    allowPreOrder: { type: Boolean, default: false },
    allowBackorder: { type: Boolean, default: false },
    isComingSoon: { type: Boolean, default: false },
    weight: { type: Number, min: 0 },
    weightUnit: { type: String, default: "kg" },
    dimensions: dimensionsSchema,
    taxClass: { type: String, default: "" },
    shippingSettings: { type: Schema.Types.Mixed, default: {} },
    seo: seoSchema,
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productVariantSchema.index({ storeId: 1, sku: 1 });
productVariantSchema.index({ productId: 1, status: 1 });

export type ProductVariantDocument = InferSchemaType<typeof productVariantSchema>;
export const ProductVariantModel = models.ProductVariant ?? model("ProductVariant", productVariantSchema);
