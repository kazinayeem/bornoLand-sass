import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, index: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    emailVerifiedAt: { type: Date, default: null },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "owner", "admin", "editor", "analyst", "viewer"],
      default: "viewer",
      index: true
    },
    provider: { type: String, default: "credentials" },
    status: { type: String, enum: ["active", "invited", "suspended", "banned"], default: "active" },
    rememberMe: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    storeName: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    timezone: { type: String, default: "Asia/Dhaka", trim: true },
    language: { type: String, default: "en", trim: true },
    bio: { type: String, default: "", trim: true, maxlength: 500 },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      dateFormat: { type: String, enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], default: "DD/MM/YYYY" },
      emailNotifications: { type: Boolean, default: true },
      browserNotifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    passwordChangedAt: { type: Date, default: null },
    sessionVersion: { type: Number, default: 0, min: 0 },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    loginCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User ?? model("User", userSchema);
