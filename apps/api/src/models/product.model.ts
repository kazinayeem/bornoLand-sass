import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    category: { type: String, default: "general", trim: true },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    stock: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    sku: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    galleryImageUrls: { type: [String], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
productSchema.index({ storeId: 1, status: 1 });

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const ProductModel = models.Product ?? model("Product", productSchema);
