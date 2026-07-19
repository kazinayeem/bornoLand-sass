import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const builderTemplateSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "custom" },
    tags: [{ type: String, trim: true }],
    industry: { type: String, default: "" },
    colorTheme: { type: String, default: "" },
    notes: { type: String, default: "" },
    folder: { type: String, default: "" },
    visibility: { type: String, enum: ["private", "team", "public"], default: "private" },

    // Template type
    templateType: {
      type: String,
      enum: ["section", "page", "header", "footer", "global"],
      default: "section",
    },

    thumbnail: { type: String, default: "" },

    // The template content
    sections: [{ type: Schema.Types.Mixed }],
    theme: { type: Schema.Types.Mixed },
    seo: { type: Schema.Types.Mixed },
    settings: { type: Schema.Types.Mixed },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    isBuiltIn: { type: Boolean, default: false },
    isShared: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

builderTemplateSchema.index({ storeId: 1, slug: 1 }, { unique: true });
builderTemplateSchema.index({ storeId: 1, category: 1 });
builderTemplateSchema.index({ storeId: 1, folder: 1 });

export type BuilderTemplateDocument = InferSchemaType<typeof builderTemplateSchema>;
export const BuilderTemplateModel = models.BuilderTemplate ?? model("BuilderTemplate", builderTemplateSchema);
