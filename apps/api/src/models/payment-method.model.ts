import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const paymentMethodSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    type: {
      type: String,
      enum: ["cod", "bkash", "nagad", "rocket", "bank"],
      required: true,
    },
    label: { type: String, required: true },
    accountNumber: { type: String, default: "" },
    accountType: {
      type: String,
      enum: ["personal", "agent", "merchant", ""],
      default: "",
    },
    instructions: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

paymentMethodSchema.index({ storeId: 1, type: 1 });

export type PaymentMethodDocument = InferSchemaType<typeof paymentMethodSchema>;
export const PaymentMethodModel =
  models.PaymentMethod ?? model("PaymentMethod", paymentMethodSchema);
