import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const deliveryZoneSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    charge: { type: Number, required: true, min: 0 },
    estimatedDays: { type: String, default: "3-5 days" },
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deliveryZoneSchema.index({ storeId: 1, name: 1 }, { unique: true });

export type DeliveryZoneDocument = InferSchemaType<typeof deliveryZoneSchema>;
export const DeliveryZoneModel =
  models.DeliveryZone ?? model("DeliveryZone", deliveryZoneSchema);
