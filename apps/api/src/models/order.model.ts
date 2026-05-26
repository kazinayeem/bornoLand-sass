import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: "" }
});

const orderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    deliveryZone: { type: String, default: "" },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "US" }
    },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    notes: { type: String, default: "" },
    orderNumber: { type: String, unique: true },
    currencyCode: { type: String, enum: ["USD", "BDT", "EUR", "INR"], default: "USD" }
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const OrderModel = models.Order ?? model("Order", orderSchema);
