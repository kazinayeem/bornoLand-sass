import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const featureSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    type: { type: String, enum: ["boolean", "limit", "tier", "numeric", "string"], required: true },
    groupKey: { type: String, default: "general", trim: true, index: true },
    sortOrder: { type: Number, default: 0 },
    usageCounterKey: { type: String, default: "" },
    unit: { type: String, default: "" },
    defaultEnabled: { type: Boolean, default: false },
    defaultLimit: { type: Number, default: 0 },
    defaultTier: { type: String, default: "disabled" },
    availablePlans: { type: [String], default: [] },
    comingSoon: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: "" },
    /** @deprecated use FeatureTier collection */
    stringOptions: { type: [String], default: [] },
    /** @deprecated use groupKey */
    group: { type: String, default: "" },
  },
  { timestamps: true }
);

export type FeatureDocument = InferSchemaType<typeof featureSchema>;
export const FeatureModel = models.Feature ?? model("Feature", featureSchema);
