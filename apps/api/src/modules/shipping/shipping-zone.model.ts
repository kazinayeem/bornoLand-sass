import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const shippingMethodSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["flat_rate", "free", "weight_based", "price_based", "local_pickup"],
      default: "flat_rate",
    },
    rate: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxWeight: { type: Number, default: 0, min: 0 },
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true }
);

const shippingZoneSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    countries: { type: [String], default: [] },
    regions: { type: [String], default: [] },
    zipCodes: { type: [String], default: [] },
    methods: [shippingMethodSchema],
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ShippingZoneDocument = InferSchemaType<typeof shippingZoneSchema>;
export const ShippingZoneModel = models.ShippingZone ?? model("ShippingZone", shippingZoneSchema);
