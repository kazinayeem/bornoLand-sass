import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const auditLogSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;

export const AuditLogModel = models.AuditLog ?? model("AuditLog", auditLogSchema);