import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const featureTierSchema = new Schema(
  {
    featureKey: { type: String, required: true, lowercase: true, trim: true, index: true },
    tierKey: { type: String, required: true, lowercase: true, trim: true },
    label: { type: String, required: true, trim: true },
    rank: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

featureTierSchema.index({ featureKey: 1, tierKey: 1 }, { unique: true });

export type FeatureTierDocument = InferSchemaType<typeof featureTierSchema>;
export const FeatureTierModel = models.FeatureTier ?? model("FeatureTier", featureTierSchema);
