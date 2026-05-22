import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    image: { type: String },
    emailVerified: { type: Date },
    role: {
      type: String,
      enum: ["super_admin", "admin", "editor", "viewer"],
      default: "viewer",
      index: true
    },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    status: { type: String, enum: ["active", "suspended", "banned"], default: "active", index: true },
    rememberMe: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    loginCount: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "users" }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User ?? model("User", userSchema);
