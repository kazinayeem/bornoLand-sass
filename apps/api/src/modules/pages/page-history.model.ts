import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const pageHistorySchema = new Schema(
  {
    pageId: { type: Schema.Types.ObjectId, ref: "StorePage", index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: {
      type: String,
      enum: [
        "created", "updated", "deleted", "published", "unpublished",
        "archived", "restored", "duplicated", "renamed", "scheduled",
        "draft_saved", "settings_updated", "seo_updated", "version_created",
        "version_restored",
      ],
      required: true,
    },
    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

pageHistorySchema.index({ storeId: 1, createdAt: -1 });
pageHistorySchema.index({ pageId: 1, createdAt: -1 });

export type PageHistoryDocument = InferSchemaType<typeof pageHistorySchema>;
export const PageHistoryModel = models.PageHistory ?? model("PageHistory", pageHistorySchema);
