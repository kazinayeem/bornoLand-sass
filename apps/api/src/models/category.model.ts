import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const categorySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    imageUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ storeId: 1, slug: 1 }, { unique: true });
categorySchema.index({ storeId: 1, sortOrder: 1 });

export type CategoryDocument = InferSchemaType<typeof categorySchema>;
export const CategoryModel = models.Category ?? model("Category", categorySchema);
