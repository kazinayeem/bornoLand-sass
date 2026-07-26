import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const priceHistorySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    field: {
      type: String,
      enum: ["sellingPrice", "comparePrice", "wholesalePrice", "discount"],
      required: true,
    },
    previousPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    reason: { type: String, default: "" },
    createdBy: { type: String, default: "system" },
    createdById: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

priceHistorySchema.index({ storeId: 1, productId: 1, createdAt: -1 });

export type PriceHistoryDocument = InferSchemaType<typeof priceHistorySchema>;
export const PriceHistoryModel =
  models.PriceHistory ?? model("PriceHistory", priceHistorySchema);
