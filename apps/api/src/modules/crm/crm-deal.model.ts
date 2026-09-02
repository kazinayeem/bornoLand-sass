import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const crmDealSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    title: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    customerEmail: { type: String, default: "" },

    value: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    stage: {
      type: String,
      enum: ["lead", "contacted", "proposal_sent", "negotiation", "won", "lost"],
      default: "lead",
      index: true,
    },
    probabilityPercent: { type: Number, default: 20, min: 0, max: 100 },
    expectedCloseDate: { type: Date, default: null },
    assignedTo: { type: String, default: "Sales Team" },
    assignedToId: { type: Schema.Types.ObjectId, default: null },

    notes: { type: String, default: "" },
    lostReason: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

crmDealSchema.index({ storeId: 1, stage: 1 });
crmDealSchema.index({ storeId: 1, createdAt: -1 });

export type CrmDealDocument = InferSchemaType<typeof crmDealSchema>;
export const CrmDealModel = models.CrmDeal ?? model("CrmDeal", crmDealSchema);
