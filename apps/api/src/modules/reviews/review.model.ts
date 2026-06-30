import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const reviewSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ storeId: 1, productId: 1, status: 1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;
export const ReviewModel = models.Review ?? model("Review", reviewSchema);
