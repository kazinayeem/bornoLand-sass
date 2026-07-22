import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const socialLinkSchema = new Schema(
  {
    facebook: { type: String, default: "", trim: true },
    instagram: { type: String, default: "", trim: true },
    x: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    youtube: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const storeEmailBrandingSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, unique: true, index: true },
    logo: { type: String, default: "", trim: true, maxlength: 2000 },
    primaryColor: { type: String, default: "#0066cc", trim: true, maxlength: 20 },
    buttonColor: { type: String, default: "#0066cc", trim: true, maxlength: 20 },
    footer: { type: String, default: "", trim: true, maxlength: 2000 },
    socialLinks: { type: socialLinkSchema, default: () => ({}) },
    website: { type: String, default: "", trim: true, maxlength: 500 },
    supportEmail: { type: String, default: "", trim: true, lowercase: true, maxlength: 320 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    address: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

export type StoreEmailBrandingDocument = InferSchemaType<typeof storeEmailBrandingSchema>;
export const StoreEmailBrandingModel = models.StoreEmailBranding ?? model("StoreEmailBranding", storeEmailBrandingSchema);
