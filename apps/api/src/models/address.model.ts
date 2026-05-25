import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const addressSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    label: { type: String, default: "Home", trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    zip: { type: String, default: "", trim: true },
    country: { type: String, default: "US", trim: true },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type AddressDocument = InferSchemaType<typeof addressSchema>;
export const AddressModel = models.Address ?? model("Address", addressSchema);
