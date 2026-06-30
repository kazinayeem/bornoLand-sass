import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const productQuestionSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    status: { type: String, enum: ["pending", "answered"], default: "pending" },
  },
  { timestamps: true }
);

export type ProductQuestionDocument = InferSchemaType<typeof productQuestionSchema>;
export const ProductQuestionModel = models.ProductQuestion ?? model("ProductQuestion", productQuestionSchema);
