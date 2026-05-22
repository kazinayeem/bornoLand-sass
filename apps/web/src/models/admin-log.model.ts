import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const adminLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true, collection: "admin_logs" }
);

export type AdminLogDocument = InferSchemaType<typeof adminLogSchema>;

export const AdminLogModel = models.AdminLog ?? model("AdminLog", adminLogSchema);
