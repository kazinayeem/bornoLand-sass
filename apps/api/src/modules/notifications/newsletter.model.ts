import mongoose, { Schema } from "mongoose";

const newsletterSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

newsletterSchema.index({ storeId: 1, email: 1 }, { unique: true });

export const NewsletterModel = mongoose.model("Newsletter", newsletterSchema);
