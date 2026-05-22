import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const verificationTokenSchema = new Schema(
  {
    identifier: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expires: { type: Date, required: true, index: true },
    purpose: { type: String, enum: ["email-verification", "password-reset"], required: true }
  },
  { timestamps: true, collection: "verification_tokens" }
);

export type VerificationTokenDocument = InferSchemaType<typeof verificationTokenSchema>;

export const VerificationTokenModel = models.VerificationToken ?? model("VerificationToken", verificationTokenSchema);