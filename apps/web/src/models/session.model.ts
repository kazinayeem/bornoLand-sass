import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    sessionToken: { type: String, required: true, unique: true, index: true },
    deviceName: { type: String },
    deviceType: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    lastSeenAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    status: { type: String, enum: ["active", "revoked", "expired"], default: "active" }
  },
  { timestamps: true, collection: "sessions" }
);

sessionSchema.index({ userId: 1, tenantId: 1, status: 1 });

export type AppSessionDocument = InferSchemaType<typeof sessionSchema>;

export const AppSessionModel = models.AppSession ?? model("AppSession", sessionSchema);
