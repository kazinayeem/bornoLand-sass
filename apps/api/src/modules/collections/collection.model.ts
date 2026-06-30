import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const collectionSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

collectionSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export type CollectionDocument = InferSchemaType<typeof collectionSchema>;
export const CollectionModel = models.Collection ?? model("Collection", collectionSchema);
