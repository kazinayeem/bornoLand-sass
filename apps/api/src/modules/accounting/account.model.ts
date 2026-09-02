import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const accountSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["asset", "liability", "equity", "revenue", "expense"],
      required: true,
      index: true,
    },
    parentAccountId: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    isSystem: { type: Boolean, default: false },
    currency: { type: String, default: "BDT" },
    currentBalance: { type: Number, default: 0 },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

accountSchema.index({ storeId: 1, code: 1 }, { unique: true });
accountSchema.index({ storeId: 1, type: 1 });

export type AccountDocument = InferSchemaType<typeof accountSchema>;
export const AccountModel = models.Account ?? model("Account", accountSchema);
