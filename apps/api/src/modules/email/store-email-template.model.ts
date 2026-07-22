import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const emailTemplateSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    subject: { type: String, required: true, trim: true, maxlength: 500 },
    body: { type: String, required: true },
    variables: [{ type: String, trim: true }],
    description: { type: String, default: "", trim: true, maxlength: 500 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

emailTemplateSchema.index({ storeId: 1, name: 1 }, { unique: true });

export type StoreEmailTemplateDocument = InferSchemaType<typeof emailTemplateSchema>;
export const StoreEmailTemplateModel = models.StoreEmailTemplate ?? model("StoreEmailTemplate", emailTemplateSchema);
