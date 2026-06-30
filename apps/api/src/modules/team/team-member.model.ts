import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const teamMemberSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    role: { type: String, enum: ["owner", "admin", "editor", "analyst", "viewer"], required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    invitedAt: { type: Date },
    acceptedAt: { type: Date },
    status: { type: String, enum: ["active", "invited", "revoked"], default: "active" }
  },
  { timestamps: true }
);

teamMemberSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

export type TeamMemberDocument = InferSchemaType<typeof teamMemberSchema>;

export const TeamMemberModel = models.TeamMember ?? model("TeamMember", teamMemberSchema);