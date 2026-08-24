import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const incompleteCheckoutItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId },
    variantTitle: { type: String, default: "" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    sku: { type: String, default: "" },
  },
  { _id: true }
);

const incompleteTimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const incompleteCheckoutSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    street: {
      type: String,
      default: "",
      trim: true,
    },
    apartment: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    area: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    zip: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "Bangladesh",
      trim: true,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },

    items: {
      type: [incompleteCheckoutItemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryZoneId: {
      type: String,
      default: "",
    },
    deliveryZoneName: {
      type: String,
      default: "",
    },
    shippingMethod: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "cod",
    },

    status: {
      type: String,
      enum: ["in_progress", "abandoned", "recovered", "converted", "expired"],
      default: "in_progress",
      index: true,
    },

    step: {
      type: String,
      default: "customer_info",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    abandonedAt: {
      type: Date,
      default: null,
    },
    recoveredAt: {
      type: Date,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },

    convertedOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    recoveryToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    timeline: {
      type: [incompleteTimelineSchema],
      default: [],
    },

    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound indexes for performant multi-tenant querying & analytics
incompleteCheckoutSchema.index({ storeId: 1, status: 1, createdAt: -1 });
incompleteCheckoutSchema.index({ storeId: 1, lastActivityAt: -1 });
incompleteCheckoutSchema.index({ storeId: 1, phone: 1 });
incompleteCheckoutSchema.index({ storeId: 1, email: 1 });
incompleteCheckoutSchema.index({ storeId: 1, sessionId: 1 });

export type IncompleteCheckoutDocument = InferSchemaType<typeof incompleteCheckoutSchema>;
export const IncompleteCheckoutModel =
  models.IncompleteCheckout ?? model("IncompleteCheckout", incompleteCheckoutSchema);
