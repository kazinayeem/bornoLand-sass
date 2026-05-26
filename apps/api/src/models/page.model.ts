import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const pageSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
      // publishStatus separates draft vs published content
      publishStatus: { type: String, enum: ["draft", "published"], default: "draft", index: true },
      // Draft content (edited in builder)
      draftSections: [{ type: Schema.Types.Mixed }],
      draftTheme: {
      primaryColor: { type: String, default: "#2563eb" },
      secondaryColor: { type: String, default: "#0f172a" },
      font: { type: String, default: "Inter" },
      buttonStyle: { type: String, default: "rounded-lg" },
      layoutWidth: { type: String, default: "1200px" },
      darkMode: { type: Boolean, default: false },
      navbarStyle: { type: String, default: "fixed" }
    },
      // Published (live) content
      publishedSections: [{ type: Schema.Types.Mixed }],
      publishedTheme: {
        primaryColor: { type: String, default: "#2563eb" },
        secondaryColor: { type: String, default: "#0f172a" },
        font: { type: String, default: "Inter" },
        buttonStyle: { type: String, default: "rounded-lg" },
        layoutWidth: { type: String, default: "1200px" },
        darkMode: { type: Boolean, default: false },
        navbarStyle: { type: String, default: "fixed" }
      },
      publishedAt: { type: Date },
      publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

pageSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export type PageDocument = InferSchemaType<typeof pageSchema>;
export const PageModel = models.Page ?? model("Page", pageSchema);
