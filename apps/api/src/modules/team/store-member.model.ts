import mongoose, { type InferSchemaType } from "mongoose";
import { STORE_MEMBER_ROLES } from "../../common/types/permissions.js";

const { Schema, model, models } = mongoose;

/**
 * StoreMember — persists store-scoped team members with granular RBAC.
 *
 * An invited member without a user account has `userId = null` and `status = "invited"`.
 * Once they accept the invite, `userId` and `acceptedAt` are populated.
 *
 * Compound unique index on `{ storeId, email }` ensures one record per email per store.
 */
const storeMemberSchema = new Schema(
  {
    storeId:  { type: Schema.Types.ObjectId, ref: "Store",  index: true, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    userId:   { type: Schema.Types.ObjectId, ref: "User",   index: true, default: null },

    email:    { type: String, required: true, lowercase: true, trim: true, index: true },
    name:     { type: String, default: "", trim: true },
    memberCode: { type: String, default: "", trim: true, index: true },

    role: {
      type: String,
      enum: STORE_MEMBER_ROLES,
      required: true,
    },

    /** Explicit granular permissions; owner automatically gets ["*"]. */
    permissions: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["active", "invited", "suspended", "revoked"],
      default: "invited",
    },

    /** Invite token sent via email — single-use, expires in 7 days. */
    inviteToken:     { type: String, index: true, select: false },
    inviteExpiresAt: { type: Date },

    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    invitedAt: { type: Date },
    acceptedAt: { type: Date },

    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

// Compound unique constraint: one record per email per store
storeMemberSchema.index({ storeId: 1, email: 1 }, { unique: true });
// Lookup by storeId + userId (for authenticated user's membership check)
storeMemberSchema.index({ storeId: 1, userId: 1 });
// Token validation
storeMemberSchema.index({ inviteToken: 1 }, { sparse: true });

export type StoreMemberDocument = InferSchemaType<typeof storeMemberSchema>;

export const StoreMemberModel =
  models.StoreMember ?? model("StoreMember", storeMemberSchema);
