import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    family: { type: String, required: true, index: true },
    rememberMe: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    deviceInfo: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically deletes documents when expiresAt is reached
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;
export const RefreshTokenModel = models.RefreshToken ?? model("RefreshToken", refreshTokenSchema);
