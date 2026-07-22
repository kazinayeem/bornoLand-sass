import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const emailLogStatuses = ["pending", "sent", "failed", "bounced", "opened", "clicked"] as const;

const storeEmailLogSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    templateName: { type: String, default: "", trim: true, maxlength: 100 },
    recipient: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    subject: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: emailLogStatuses, default: "pending" },
    sentAt: { type: Date },
    retries: { type: Number, default: 0, min: 0 },
    maxRetries: { type: Number, default: 3, min: 0 },
    providerResponse: { type: String, default: "", maxlength: 2000 },
    errorMessage: { type: String, default: "", maxlength: 2000 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

storeEmailLogSchema.index({ storeId: 1, createdAt: -1 });
storeEmailLogSchema.index({ storeId: 1, status: 1 });
storeEmailLogSchema.index({ storeId: 1, recipient: 1 });

export type StoreEmailLogDocument = InferSchemaType<typeof storeEmailLogSchema>;
export const StoreEmailLogModel = models.StoreEmailLog ?? model("StoreEmailLog", storeEmailLogSchema);
