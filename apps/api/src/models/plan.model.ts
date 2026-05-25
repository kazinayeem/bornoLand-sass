import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    priceBDT: { type: Number, required: true, min: 0 },
    trialDays: { type: Number, default: 0, min: 0 },
    features: { type: [String], default: [] },
    limits: {
      stores: { type: Number, default: 1 },
      products: { type: Number, default: 0 },
      staff: { type: Number, default: 0 },
      bandwidthGB: { type: Number, default: 0 }
    },
    isRecommended: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

planSchema.index({ slug: 1 }, { unique: true });

export type PlanDocument = InferSchemaType<typeof planSchema>;
export const PlanModel = models.Plan ?? model("Plan", planSchema);