import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storePaymentGatewaySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    provider: {
      type: String,
      enum: ["sslcommerz"],
      required: true,
      lowercase: true,
      trim: true,
    },
    storeIdValue: { type: String, default: "", trim: true },
    encryptedStorePassword: { type: String, default: "" },
    environment: {
      type: String,
      enum: ["sandbox", "live"],
      default: "sandbox",
    },
    isEnabled: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    lastTestedAt: { type: Date, default: null },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

storePaymentGatewaySchema.index({ storeId: 1, provider: 1 }, { unique: true });

export type StorePaymentGatewayDocument = InferSchemaType<typeof storePaymentGatewaySchema>;
export const StorePaymentGatewayModel =
  models.StorePaymentGateway ?? model("StorePaymentGateway", storePaymentGatewaySchema);
export const ShopPaymentGatewayModel = StorePaymentGatewayModel;
