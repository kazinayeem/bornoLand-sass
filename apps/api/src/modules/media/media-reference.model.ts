import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const mediaReferenceSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    mediaFileId: { type: Schema.Types.ObjectId, ref: "MediaFile", required: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    fieldPath: { type: String, required: true, trim: true },
    label: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

mediaReferenceSchema.index({ storeId: 1, mediaFileId: 1 });
mediaReferenceSchema.index({ storeId: 1, entityType: 1, entityId: 1 });
mediaReferenceSchema.index({ storeId: 1, entityType: 1, entityId: 1, fieldPath: 1 }, { unique: true });

export type MediaReferenceDocument = InferSchemaType<typeof mediaReferenceSchema>;
export const MediaReferenceModel =
  models.MediaReference ?? model("MediaReference", mediaReferenceSchema);
