import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const globalSectionSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, default: "custom" },
    category: { type: String, default: "custom" },

    // The actual section data (same shape as BuilderSection in frontend)
    sections: [{ type: Schema.Types.Mixed }],

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Counter-reference: pages that use this global section
    usedOnPages: [{ type: Schema.Types.ObjectId, ref: "StorePage" }],

    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

globalSectionSchema.index({ storeId: 1, slug: 1 }, { unique: true });
globalSectionSchema.index({ storeId: 1, status: 1 });

export type GlobalSectionDocument = InferSchemaType<typeof globalSectionSchema>;
export const GlobalSectionModel = models.GlobalSection ?? model("GlobalSection", globalSectionSchema);
