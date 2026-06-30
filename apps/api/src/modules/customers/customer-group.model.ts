import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const customerGroupSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

customerGroupSchema.index({ storeId: 1, name: 1 }, { unique: true });

export type CustomerGroupDocument = InferSchemaType<typeof customerGroupSchema>;
export const CustomerGroupModel = models.CustomerGroup ?? model("CustomerGroup", customerGroupSchema);
