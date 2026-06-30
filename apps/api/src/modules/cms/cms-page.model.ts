import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const pageContentSchema = new Schema({
  type: { type: String, required: true },
  content: { type: Schema.Types.Mixed },
  attrs: { type: Schema.Types.Mixed },
});

const cmsPageSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: [pageContentSchema],
    html: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    published: { type: Boolean, default: true },
    layout: { type: String, enum: ["default", "full-width", "sidebar"], default: "default" },
  },
  { timestamps: true }
);

cmsPageSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export type CmsPageDocument = InferSchemaType<typeof cmsPageSchema>;
export const CmsPageModel = models.CmsPage ?? model("CmsPage", cmsPageSchema);
