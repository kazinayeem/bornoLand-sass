import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const brandSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    logoUrl: { type: String, default: "" },
    logoId: { type: Schema.Types.ObjectId, ref: "MediaFile", default: null },
    bannerUrl: { type: String, default: "" },
    bannerId: { type: Schema.Types.ObjectId, ref: "MediaFile", default: null },
    website: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

brandSchema.index({ storeId: 1, slug: 1 }, { unique: true });
brandSchema.index({ storeId: 1, sortOrder: 1 });
brandSchema.index({ storeId: 1, active: 1 });
brandSchema.index({ name: "text", description: "text" });

export type BrandDocument = InferSchemaType<typeof brandSchema>;
export const BrandModel = models.Brand ?? model("Brand", brandSchema);
