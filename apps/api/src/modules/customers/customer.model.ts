import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const customerSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
    phone: { type: String, default: "", trim: true },
    avatar: { type: String, default: "" },
    birthday: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "non_binary", "prefer_not_to_say", ""], default: "" },
    /**
     * Increments when we need to invalidate all existing customer JWTs
     * (e.g. "logout all devices", password change).
     */
    tokenVersion: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["active", "suspended", "inactive"], default: "active" },
    lastLoginAt: { type: Date },
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    averageOrderValue: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    isGuest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

customerSchema.index({ storeId: 1, email: 1 }, { unique: true });
customerSchema.index({ storeId: 1, createdAt: -1 });
customerSchema.index({ storeId: 1, totalSpent: -1 });

export type CustomerDocument = InferSchemaType<typeof customerSchema>;
export const CustomerModel = models.Customer ?? model("Customer", customerSchema);
