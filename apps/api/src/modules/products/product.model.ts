import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const digitalAssetSchema = new Schema(
  {
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    downloadLimit: { type: Number, default: 0 },
    expiryDays: { type: Number, default: 0 },
  },
  { _id: false }
);

const seoSchema = new Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    productType: {
      type: String,
      enum: ["simple", "variable", "digital", "downloadable", "service"],
      default: "simple",
    },
    defaultVariantId: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    category: { type: String, default: "general", trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    collectionIds: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    tags: { type: [String], default: [] },
    brand: { type: String, default: "", trim: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", default: null },

    vendor: { type: String, default: "", trim: true },
    barcode: { type: String, default: "", trim: true },
    stock: { type: Number, default: 0, min: 0 },
    trackInventory: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    status: {
      type: String,
      enum: ["draft", "active", "archived", "scheduled", "inactive"],
      default: "active",
    },
    scheduledAt: { type: Date },
    sku: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    featuredImageId: { type: Schema.Types.ObjectId, ref: "MediaFile", default: null },
    galleryImageIds: [{ type: Schema.Types.ObjectId, ref: "MediaFile" }],
    galleryImageUrls: { type: [String], default: [] },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    relatedProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    upsellProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    crossSellProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    weight: { type: Number, min: 0 },
    weightUnit: { type: String, default: "kg" },
    digitalAsset: digitalAssetSchema,
    seo: seoSchema,
    options: [
      {
        name: { type: String, required: true },
        values: [{ type: String, required: true }],
      },
    ],
    variants: [
      {
        optionValues: { type: Map, of: String, default: {} },
        price: { type: Number, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        sku: { type: String, default: "" },
        barcode: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
        enabled: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
productSchema.index({ storeId: 1, status: 1 });
productSchema.index({ storeId: 1, featured: 1 });
productSchema.index({ storeId: 1, productType: 1 });
productSchema.index({ storeId: 1, featured: 1, createdAt: -1 });
productSchema.index({ storeId: 1, category: 1 });
productSchema.index({ storeId: 1, categoryIds: 1, status: 1, createdAt: -1 });
productSchema.index({ storeId: 1, brand: 1, status: 1 });
productSchema.index({ storeId: 1, price: 1, status: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const ProductModel = models.Product ?? model("Product", productSchema);

