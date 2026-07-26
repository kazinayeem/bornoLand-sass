import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productTimelineSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    eventType: {
      type: String,
      enum: [
        "created",
        "price_changed",
        "cost_changed",
        "stock_added",
        "stock_removed",
        "purchase_received",
        "variant_added",
        "variant_removed",
        "supplier_changed",
        "order_sold",
        "returned",
        "transferred",
        "archived",
        "other",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    detail: { type: String, default: "" },
    reference: { type: String, default: "" },
    referenceId: { type: Schema.Types.ObjectId, default: null },
    actorName: { type: String, default: "system" },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

productTimelineSchema.index({ storeId: 1, productId: 1, createdAt: -1 });

export type ProductTimelineDocument = InferSchemaType<typeof productTimelineSchema>;
export const ProductTimelineModel =
  models.ProductTimeline ?? model("ProductTimeline", productTimelineSchema);
