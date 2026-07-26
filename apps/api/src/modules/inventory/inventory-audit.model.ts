import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const inventoryAuditSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorName: { type: String, default: "system" },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId, default: null },
    oldValue: { type: Schema.Types.Mixed, default: null },
    newValue: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    device: { type: String, default: "" },
  },
  { timestamps: true }
);

inventoryAuditSchema.index({ storeId: 1, createdAt: -1 });
inventoryAuditSchema.index({ storeId: 1, entityType: 1, entityId: 1 });

export type InventoryAuditDocument = InferSchemaType<typeof inventoryAuditSchema>;
export const InventoryAuditModel =
  models.InventoryAudit ?? model("InventoryAudit", inventoryAuditSchema);
