import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const planFeatureSchema = new Schema(
  {
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true, index: true },
    featureKey: { type: String, required: true, trim: true, lowercase: true },
    enabled: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
    tierKey: { type: String, default: "disabled" },
    /** @deprecated use tierKey */
    value: { type: String, default: "" },
  },
  { timestamps: true }
);

planFeatureSchema.index({ planId: 1, featureKey: 1 }, { unique: true });

export type PlanFeatureDocument = InferSchemaType<typeof planFeatureSchema>;
export const PlanFeatureModel = models.PlanFeature ?? model("PlanFeature", planFeatureSchema);
