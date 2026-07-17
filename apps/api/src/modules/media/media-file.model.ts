import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const mediaFileSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User" },
    folder: { type: String, default: "general", trim: true, index: true },
    originalName: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, trim: true },
    displayName: { type: String, default: "", trim: true },
    fileType: { type: String, enum: ["image", "document", "video", "audio", "other"], default: "other" },
    mimeType: { type: String, required: true },
    extension: { type: String, default: "" },
    size: { type: Number, required: true, min: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    hash: { type: String, default: "", index: true },
    storageProvider: { type: String, enum: ["local", "s3"], default: "local" },
    storagePath: { type: String, required: true },
    publicUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    tags: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

mediaFileSchema.index({ storeId: 1, hash: 1 });
mediaFileSchema.index({ storeId: 1, isDeleted: 1, createdAt: -1 });
mediaFileSchema.index({ storeId: 1, folder: 1 });
mediaFileSchema.index({ storeId: 1, folder: 1, createdAt: -1 });
mediaFileSchema.index({ storeId: 1, isDeleted: 1 });
mediaFileSchema.index({ storeId: 1, isDeleted: 1, fileType: 1 });

export type MediaFileDocument = InferSchemaType<typeof mediaFileSchema>;
export const MediaFileModel = models.MediaFile ?? model("MediaFile", mediaFileSchema);
