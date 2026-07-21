import mongoose, { Schema } from "mongoose";

export const CONTACT_STATUSES = ["new", "read", "replied", "closed", "spam"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

const contactSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: "", trim: true },
  subject: { type: String, default: "", trim: true, maxlength: 300 },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: CONTACT_STATUSES, default: "new", index: true },
  notes: { type: String, default: "", trim: true, maxlength: 5000 },
  archivedAt: { type: Date, default: null, index: true },
  repliedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
});

contactSchema.index({ storeId: 1, createdAt: -1 });
contactSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export const ContactModel = mongoose.model("Contact", contactSchema);
