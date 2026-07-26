import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const supplierSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "inactive", "blocked"], default: "active" },
    notes: { type: String, default: "" },
    totalPurchases: { type: Number, default: 0, min: 0 },
    outstandingDue: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

supplierSchema.index({ storeId: 1, name: 1 });
supplierSchema.index({ storeId: 1, code: 1 });

export type SupplierDocument = InferSchemaType<typeof supplierSchema>;
export const SupplierModel = models.Supplier ?? model("Supplier", supplierSchema);
