import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storageUsageSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, unique: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    usedBytes: { type: Number, default: 0, min: 0 },
    limitBytes: { type: Number, default: 0, min: 0 },
    fileCount: { type: Number, default: 0, min: 0 },
    imageCount: { type: Number, default: 0, min: 0 },
    documentCount: { type: Number, default: 0, min: 0 },
    videoCount: { type: Number, default: 0, min: 0 },
    uploadsSuspended: { type: Boolean, default: false },
    unlimited: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type StorageUsageDocument = InferSchemaType<typeof storageUsageSchema>;
export const StorageUsageModel = models.StorageUsage ?? model("StorageUsage", storageUsageSchema);
