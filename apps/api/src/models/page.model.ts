import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const pageSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true, trim: true },
    draftData: { type: Schema.Types.Mixed, required: true },
    publishedData: { type: Schema.Types.Mixed },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      ogImageUrl: { type: String },
      noIndex: { type: Boolean, default: false }
    },
    publishStatus: { type: String, enum: ["draft", "published", "scheduled"], default: "draft" },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

pageSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export type PageDocument = InferSchemaType<typeof pageSchema>;

export const PageModel = models.Page ?? model("Page", pageSchema);