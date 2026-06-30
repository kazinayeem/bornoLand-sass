import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: "", trim: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

export const ContactModel = mongoose.model("Contact", contactSchema);
