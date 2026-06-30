import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const featureGroupSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type FeatureGroupDocument = InferSchemaType<typeof featureGroupSchema>;
export const FeatureGroupModel = models.FeatureGroup ?? model("FeatureGroup", featureGroupSchema);
