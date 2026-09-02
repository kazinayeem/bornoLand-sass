import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storagePlanSchema = new Schema(
  {
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true, unique: true },
    storageLimitMB: { type: Number, default: 0 },
    maxFileSizeMB: { type: Number, default: 10 },
    allowedMimeTypes: { type: [String], default: [] },
    maxUploads: { type: Number, default: 0 },
    maxImages: { type: Number, default: 0 },
    maxDocuments: { type: Number, default: 0 },
    unlimited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type StoragePlanDocument = InferSchemaType<typeof storagePlanSchema>;
export const StoragePlanModel = models.StoragePlan ?? model("StoragePlan", storagePlanSchema);
