import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const couponSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping", "buy_x_get_y"],
      default: "percentage",
    },
    value: { type: Number, default: 0, min: 0 },
    buyQuantity: { type: Number, default: 0, min: 0 },
    getQuantity: { type: Number, default: 0, min: 0 },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },
    maximumDiscount: { type: Number, default: 0, min: 0 },
    firstOrderOnly: { type: Boolean, default: false },
    customerIds: [{ type: Schema.Types.ObjectId, ref: "Customer" }],
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    usageLimit: { type: Number, default: 0 },
    usagePerCustomer: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    autoApply: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "active", "expired"], default: "draft" },
  },
  { timestamps: true }
);

couponSchema.index({ storeId: 1, code: 1 }, { unique: true });
couponSchema.index({ storeId: 1, status: 1 });

export type CouponDocument = InferSchemaType<typeof couponSchema>;
export const CouponModel = models.Coupon ?? model("Coupon", couponSchema);
