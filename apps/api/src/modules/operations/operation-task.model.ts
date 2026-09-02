import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const operationTaskSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    taskNumber: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    module: {
      type: String,
      enum: ["inventory", "hrm", "finance", "pos", "orders", "marketing", "general"],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "under_review", "completed", "cancelled"],
      default: "todo",
      index: true,
    },
    assignedTo: { type: String, default: "Operations Team" },
    assignedToId: { type: Schema.Types.ObjectId, default: null },
    dueDate: { type: Date, default: null },

    isApprovalWorkflow: { type: Boolean, default: false },
    approvedBy: { type: String, default: "" },
    approvedAt: { type: Date, default: null },

    entityReference: {
      entityType: { type: String, default: "" }, // e.g. "PurchaseOrder", "WasteLog", "Payroll", "Leave"
      entityId: { type: Schema.Types.ObjectId, default: null },
    },
    createdBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

operationTaskSchema.index({ storeId: 1, status: 1 });
operationTaskSchema.index({ storeId: 1, module: 1 });

export type OperationTaskDocument = InferSchemaType<typeof operationTaskSchema>;
export const OperationTaskModel = models.OperationTask ?? model("OperationTask", operationTaskSchema);
