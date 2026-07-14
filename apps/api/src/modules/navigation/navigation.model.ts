import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const navigationSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    key: {
      type: String,
      enum: ["primary", "footer", "mobile", "top_bar", "account", "sidebar"],
      required: true,
    },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

navigationSchema.index({ storeId: 1, key: 1 }, { unique: true });

export type NavigationDocument = InferSchemaType<typeof navigationSchema>;
export const NavigationModel = models.Navigation ?? model("Navigation", navigationSchema);
