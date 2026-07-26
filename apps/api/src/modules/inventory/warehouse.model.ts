import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const warehouseSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    managerName: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

warehouseSchema.index({ storeId: 1, code: 1 });
warehouseSchema.index({ storeId: 1, isDefault: 1 });

export type WarehouseDocument = InferSchemaType<typeof warehouseSchema>;
export const WarehouseModel = models.Warehouse ?? model("Warehouse", warehouseSchema);
