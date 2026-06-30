import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const platformPaymentMethodSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "bank"],
      required: true,
      unique: true,
    },
    label: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    merchantNumber: { type: String, default: "", trim: true },
    personalNumber: { type: String, default: "", trim: true },
    accountName: { type: String, default: "", trim: true },
    bankName: { type: String, default: "", trim: true },
    branchName: { type: String, default: "", trim: true },
    instructions: { type: String, default: "" },
    qrCodeUrl: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type PlatformPaymentMethodDocument = InferSchemaType<typeof platformPaymentMethodSchema>;
export const PlatformPaymentMethodModel =
  models.PlatformPaymentMethod ?? model("PlatformPaymentMethod", platformPaymentMethodSchema);
