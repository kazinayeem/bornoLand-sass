import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const trafficSourceSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", default: null },
    source: { type: String, required: true },
    type: { type: String, enum: ["direct", "search", "social", "email", "referral", "qr", "utm", "other"], required: true },
    medium: { type: String, default: "" },
    campaign: { type: String, default: "" },
    visits: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

trafficSourceSchema.index({ storeId: 1, source: 1 }, { unique: true });
trafficSourceSchema.index({ storeId: 1, type: 1 });
trafficSourceSchema.index({ storeId: 1, visits: -1 });

export type TrafficSourceDocument = InferSchemaType<typeof trafficSourceSchema>;
export const TrafficSourceModel = models.TrafficSource ?? model("TrafficSource", trafficSourceSchema);
