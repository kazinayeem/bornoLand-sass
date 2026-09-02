import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const socialLinksSchema = new Schema(
  {
    facebook: { type: String, default: "", trim: true },
    instagram: { type: String, default: "", trim: true },
    x: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    youtube: { type: String, default: "", trim: true },
    telegram: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const storeContactSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, unique: true },
    businessName: { type: String, default: "", trim: true, maxlength: 200 },
    email: { type: String, default: "", trim: true, lowercase: true, maxlength: 320 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    whatsapp: { type: String, default: "", trim: true, maxlength: 40 },
    address: { type: String, default: "", trim: true, maxlength: 500 },
    city: { type: String, default: "", trim: true, maxlength: 120 },
    country: { type: String, default: "", trim: true, maxlength: 120 },
    postalCode: { type: String, default: "", trim: true, maxlength: 32 },
    googleMapsEmbedUrl: { type: String, default: "", trim: true, maxlength: 2000 },
    latitude: { type: String, default: "", trim: true, maxlength: 32 },
    longitude: { type: String, default: "", trim: true, maxlength: 32 },
    businessHours: { type: String, default: "", trim: true, maxlength: 2000 },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type StoreContactDocument = InferSchemaType<typeof storeContactSchema>;
export const StoreContactModel = models.StoreContact ?? model("StoreContact", storeContactSchema);
