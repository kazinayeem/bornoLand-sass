import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const purchaseOrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    sku: { type: String, default: "" },
    name: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 0 },
    receivedQty: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const purchaseOrderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", default: null },
    poNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "pending", "ordered", "partial", "received", "cancelled"],
      default: "draft",
    },
    items: { type: [purchaseOrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "" },
    orderedAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ storeId: 1, poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export type PurchaseOrderDocument = InferSchemaType<typeof purchaseOrderSchema>;
export const PurchaseOrderModel =
  models.PurchaseOrder ?? model("PurchaseOrder", purchaseOrderSchema);
