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
    updatedBy: { type: String, default: "" },
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

const paymentVerificationSchema = new Schema(
  {
    transactionId: { type: String, default: "" },
    senderNumber: { type: String, default: "" },
    receiverNumber: { type: String, default: "" },
    screenshotUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", ""],
      default: "",
    },
    reviewedBy: { type: String, default: "" },
    reviewedAt: { type: Date },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: false, index: true },
    customerType: { type: String, enum: ["registered", "guest"], default: "registered" },
    customerSnapshot: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      country: { type: String, default: "Bangladesh" },
      countryCode: { type: String, default: "BD" },
      division: { type: String, default: "" },
      divisionId: { type: String, default: "" },
      district: { type: String, default: "" },
      districtId: { type: String, default: "" },
      upazila: { type: String, default: "" },
      upazilaId: { type: String, default: "" },
      union: { type: String, default: "" },
      village: { type: String, default: "" },
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      area: { type: String, default: "" },
      zip: { type: String, default: "" },
    },
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
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
        "partial_refund",
      ],
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      label: { type: String, default: "Home" },
      area: { type: String, default: "" },
      street: { type: String, required: true },
      apartment: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "Bangladesh" },
      countryCode: { type: String, default: "BD" },
      division: { type: String, default: "" },
      divisionId: { type: String, default: "" },
      divisionName: { type: String, default: "" },
      divisionNameBn: { type: String, default: "" },
      district: { type: String, default: "" },
      districtId: { type: String, default: "" },
      districtName: { type: String, default: "" },
      districtNameBn: { type: String, default: "" },
      upazila: { type: String, default: "" },
      upazilaId: { type: String, default: "" },
      upazilaName: { type: String, default: "" },
      upazilaNameBn: { type: String, default: "" },
      union: { type: String, default: "" },
      unionId: { type: String, default: "" },
      village: { type: String, default: "" },
      landmark: { type: String, default: "" },
      orderNotes: { type: String, default: "" },
    },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["pending", "pending_verification", "paid", "partial", "failed", "refunded"],
      default: "pending",
    },
    paymentVerification: { type: paymentVerificationSchema, default: () => ({}) },
    paymentDetails: {
      senderNumber: { type: String, default: "" },
      receiverNumber: { type: String, default: "" },
      transactionId: { type: String, default: "" },
      valId: { type: String, default: "" },
      bankTranId: { type: String, default: "" },
      cardType: { type: String, default: "" },
      cardBrand: { type: String, default: "" },
      cardIssuer: { type: String, default: "" },
      tranDate: { type: String, default: "" },
      gateway: { type: String, default: "" },
      sessionKey: { type: String, default: "" },
      environment: { type: String, default: "" },
      verifiedAt: { type: String, default: "" },
      tenderedAmount: { type: Number, default: 0 },
      changeAmount: { type: Number, default: 0 },
    },
    courier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    estimatedDelivery: { type: String, default: "" },
    shipment: {
      provider: { type: String, default: "" },
      providerName: { type: String, default: "" },
      consignmentId: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      status: {
        type: String,
        enum: [
          "",
          "pending",
          "created",
          "picked",
          "in_transit",
          "hub_received",
          "out_for_delivery",
          "delivered",
          "returned",
          "cancelled",
          "failed",
        ],
        default: "",
      },
      environment: { type: String, enum: ["", "sandbox", "production"], default: "" },
      weightKg: { type: Number, default: 0 },
      codAmount: { type: Number, default: 0 },
      packageType: { type: String, default: "parcel" },
      specialInstruction: { type: String, default: "" },
      estimatedCharge: { type: Number, default: null },
      estimatedDelivery: { type: String, default: "" },
      createdAt: { type: Date },
      cancelledAt: { type: Date },
      lastSyncedAt: { type: Date },
      rawResponse: { type: Schema.Types.Mixed, default: null },
      lastError: { type: String, default: "" },
      autoCreated: { type: Boolean, default: false },
      attempts: { type: Number, default: 0 },
    },
    notes: { type: String, default: "" },
    orderNotes: [orderNoteSchema],
    timeline: [timelineEventSchema],
    orderNumber: { type: String, unique: true },
    currencyCode: { type: String, enum: ["USD", "BDT", "EUR", "INR", "GBP"], default: "USD" },
    invoiceNumber: { type: String, default: "" },
    verificationToken: { type: String, unique: true, sparse: true },
    idempotencyKey: { type: String, sparse: true, index: true },
    channel: { type: String, enum: ["online", "pos"], default: "online", index: true },
    isPos: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, orderNumber: 1 });
orderSchema.index({ storeId: 1, paymentStatus: 1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, idempotencyKey: 1 }, { sparse: true });

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const OrderModel = models.Order ?? model("Order", orderSchema);
