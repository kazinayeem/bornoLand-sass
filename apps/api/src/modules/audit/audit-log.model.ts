import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const changeSchema = new Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const auditLogSchema = new Schema(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    workspaceName: { type: String, default: "" },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    storeName: { type: String, default: "" },
    actorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorName: { type: String, default: "" },
    actorEmail: { type: String, default: "" },
    actorRole: { type: String, default: "", index: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    entityName: { type: String, default: "" },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    changes: { type: [changeSchema], default: [] },
    description: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    device: { type: String, default: "" },
    browser: { type: String, default: "" },
    operatingSystem: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    sessionId: { type: String, default: "", index: true },
    status: { type: String, enum: ["success", "failure"], default: "success", index: true },
    metadata: { type: Schema.Types.Mixed },
    immutable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ storeId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, module: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({
  actorName: "text",
  actorEmail: "text",
  entityName: "text",
  description: "text",
  action: "text",
  storeName: "text",
  workspaceName: "text",
});

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;

export const AuditLogModel = models.AuditLog ?? model("AuditLog", auditLogSchema);
