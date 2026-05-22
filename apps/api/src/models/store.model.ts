import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storeSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    subdomain: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "general", trim: true },
    plan: { type: String, enum: ["free", "starter", "growth", "enterprise"], default: "free" },
    status: { type: String, enum: ["active", "suspended", "draft"], default: "draft" },
    logoUrl: { type: String, default: "" },
    selectedTemplateId: { type: Schema.Types.ObjectId, ref: "Template" },
    theme: {
      primaryColor: { type: String, default: "#2563eb" },
      secondaryColor: { type: String, default: "#0f172a" },
      font: { type: String, default: "Inter" },
      buttonStyle: { type: String, default: "rounded-lg" },
      layoutWidth: { type: String, default: "1200px" },
      darkMode: { type: Boolean, default: false },
      navbarStyle: { type: String, default: "fixed" }
    }
  },
  { timestamps: true }
);

storeSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export type StoreDocument = InferSchemaType<typeof storeSchema>;
export const StoreModel = models.Store ?? model("Store", storeSchema);
