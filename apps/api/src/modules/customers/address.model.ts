import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const addressSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    label: { type: String, default: "Home", trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    area: { type: String, default: "", trim: true },
    street: { type: String, required: true, trim: true },
    apartment: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    zip: { type: String, default: "", trim: true },
    country: { type: String, default: "Bangladesh", trim: true },
    landmark: { type: String, default: "", trim: true },
    orderNotes: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ customerId: 1, createdAt: -1 });
addressSchema.index(
  { customerId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

export type AddressDocument = InferSchemaType<typeof addressSchema>;
export const AddressModel = models.Address ?? model("Address", addressSchema);
