import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const customerSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

customerSchema.index({ storeId: 1, email: 1 }, { unique: true });

export type CustomerDocument = InferSchemaType<typeof customerSchema>;
export const CustomerModel = models.Customer ?? model("Customer", customerSchema);
