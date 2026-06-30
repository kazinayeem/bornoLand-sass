import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const featureLimitSchema = new Schema(
  {
    featureKey: { type: String, required: true, unique: true, lowercase: true, trim: true },
    unit: { type: String, default: "" },
    unlimitedValue: { type: Number, default: 0 },
    defaultLimit: { type: Number, default: 0 },
    displayFormat: { type: String, default: "{current} / {limit}" },
  },
  { timestamps: true }
);

export type FeatureLimitDocument = InferSchemaType<typeof featureLimitSchema>;
export const FeatureLimitModel = models.FeatureLimit ?? model("FeatureLimit", featureLimitSchema);
