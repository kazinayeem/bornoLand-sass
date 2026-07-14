import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const pageVersionSchema = new Schema(
  {
    pageId: { type: Schema.Types.ObjectId, ref: "StorePage", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },

    sections: [{ type: Schema.Types.Mixed }],
    html: { type: String, default: "" },

    theme: { type: Schema.Types.Mixed },
    seo: { type: Schema.Types.Mixed },
    settings: { type: Schema.Types.Mixed },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String, default: "" },

    snapshot: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

pageVersionSchema.index({ pageId: 1, version: -1 });
pageVersionSchema.index({ storeId: 1, createdAt: -1 });

export type PageVersionDocument = InferSchemaType<typeof pageVersionSchema>;
export const PageVersionModel = models.PageVersion ?? model("PageVersion", pageVersionSchema);
