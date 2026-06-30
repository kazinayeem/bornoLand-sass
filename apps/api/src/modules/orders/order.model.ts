import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: Schema.Types.ObjectId },
  variantTitle: { type: String, default: "" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: "" },
  sku: { type: String, default: "" },
});

const timelineEventSchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    createdBy: { type: String, default: "system" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderNoteSchema = new Schema(
  {
    body: { type: String, required: true },
    type: { type: String, enum: ["internal", "customer"], default: "internal" },
    createdBy: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    deliveryZone: { type: String, default: "" },
    tax: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
    refundAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "packed", "shipped", "delivered", "cancelled", "refunded", "partial_refund"],
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "US" },
    },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "failed", "refunded"],
      default: "pending",
    },
    notes: { type: String, default: "" },
    orderNotes: [orderNoteSchema],
    timeline: [timelineEventSchema],
    orderNumber: { type: String, unique: true },
    currencyCode: { type: String, enum: ["USD", "BDT", "EUR", "INR", "GBP"], default: "USD" },
    invoiceNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const OrderModel = models.Order ?? model("Order", orderSchema);
