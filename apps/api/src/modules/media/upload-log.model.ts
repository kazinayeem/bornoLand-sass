import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const uploadLogSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    mediaFileId: { type: Schema.Types.ObjectId, ref: "MediaFile" },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, enum: ["upload", "delete", "replace", "bulk_delete", "admin_delete", "cleanup"], required: true },
    fileName: { type: String, default: "" },
    size: { type: Number, default: 0 },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

uploadLogSchema.index({ storeId: 1, createdAt: -1 });

export type UploadLogDocument = InferSchemaType<typeof uploadLogSchema>;
export const UploadLogModel = models.UploadLog ?? model("UploadLog", uploadLogSchema);
