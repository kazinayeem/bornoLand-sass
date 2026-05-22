import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const membershipSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["super_admin", "admin", "editor", "viewer"], default: "viewer", index: true },
    status: { type: String, enum: ["active", "invited", "revoked"], default: "active" },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    invitedAt: { type: Date },
    acceptedAt: { type: Date }
  },
  { timestamps: true, collection: "memberships" }
);

membershipSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

export type MembershipDocument = InferSchemaType<typeof membershipSchema>;

export const MembershipModel = models.Membership ?? model("Membership", membershipSchema);
