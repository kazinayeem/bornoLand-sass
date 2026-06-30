import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const faqSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    category: { type: String, default: "general" },
  },
  { timestamps: true }
);

faqSchema.index({ storeId: 1, sortOrder: 1 });

export type FaqDocument = InferSchemaType<typeof faqSchema>;
export const FaqModel = models.Faq ?? model("Faq", faqSchema);
