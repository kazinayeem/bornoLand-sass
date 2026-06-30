import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const taxClassSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    rate: { type: Number, default: 0, min: 0 },
    country: { type: String, default: "" },
    region: { type: String, default: "" },
    inclusive: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

taxClassSchema.index({ storeId: 1, name: 1 }, { unique: true });

export type TaxClassDocument = InferSchemaType<typeof taxClassSchema>;
export const TaxClassModel = models.TaxClass ?? model("TaxClass", taxClassSchema);
