import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const customerSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "", trim: true },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["active", "suspended", "inactive"], default: "active" },
    lastLoginAt: { type: Date },
    totalOrders: { type: Number, default: 0 },
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

export type CustomerDocument = InferSchemaType<typeof customerSchema>;
export const CustomerModel = models.Customer ?? model("Customer", customerSchema);
