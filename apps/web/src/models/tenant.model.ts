import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const tenantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    subdomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    customDomain: { type: String, unique: true, sparse: true, trim: true },
    status: { type: String, enum: ["active", "suspended", "trialing"], default: "trialing" },
    plan: { type: String, enum: ["free", "starter", "growth", "enterprise"], default: "free" },
    branding: {
      logoUrl: { type: String },
      primaryColor: { type: String, default: "#0f172a" },
      accentColor: { type: String, default: "#2563eb" }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true, collection: "tenants" }
);

export type TenantDocument = InferSchemaType<typeof tenantSchema>;

export const TenantModel = models.Tenant ?? model("Tenant", tenantSchema);
