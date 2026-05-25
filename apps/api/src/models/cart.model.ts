import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  image: { type: String, default: "" }
});

const cartSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    sessionId: { type: String, index: true },
    items: [cartItemSchema],
    couponCode: { type: String, default: "" },
    discount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

cartSchema.index({ storeId: 1, customerId: 1 }, { unique: true, sparse: true });
cartSchema.index({ storeId: 1, sessionId: 1 }, { unique: true, sparse: true });

export type CartDocument = InferSchemaType<typeof cartSchema>;
export const CartModel = models.Cart ?? model("Cart", cartSchema);
