import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const campaignSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["discount", "flash_sale", "banner", "announcement"], default: "discount" },
    description: { type: String, default: "" },
    bannerImageUrl: { type: String, default: "" },
    bannerLink: { type: String, default: "" },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    startsAt: { type: Date },
    endsAt: { type: Date },
    status: { type: String, enum: ["draft", "active", "ended"], default: "draft" },
  },
  { timestamps: true }
);

campaignSchema.index({ storeId: 1, status: 1 });

export type CampaignDocument = InferSchemaType<typeof campaignSchema>;
export const CampaignModel = models.Campaign ?? model("Campaign", campaignSchema);
