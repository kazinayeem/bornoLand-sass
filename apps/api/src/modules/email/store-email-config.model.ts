import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const encryptionOptions = ["tls", "ssl", "starttls", "none"] as const;

const storeEmailConfigSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, unique: true, index: true },
    senderName: { type: String, default: "", trim: true, maxlength: 200 },
    senderEmail: { type: String, default: "", trim: true, lowercase: true, maxlength: 320 },
    smtpHost: { type: String, default: "", trim: true, maxlength: 255 },
    smtpPort: { type: Number, default: 587, min: 1, max: 65535 },
    smtpUser: { type: String, default: "", trim: true, maxlength: 255 },
    smtpPassEncrypted: { type: String, default: "" },
    encryption: { type: String, enum: encryptionOptions, default: "tls" },
    replyToEmail: { type: String, default: "", trim: true, lowercase: true, maxlength: 320 },
    bccEmail: { type: String, default: "", trim: true, lowercase: true, maxlength: 320 },
    enabled: { type: Boolean, default: false },
    defaultLanguage: { type: String, default: "en", trim: true, maxlength: 10 },
    timezone: { type: String, default: "UTC", trim: true, maxlength: 64 },
  },
  { timestamps: true }
);

export type StoreEmailConfigDocument = InferSchemaType<typeof storeEmailConfigSchema>;
export const StoreEmailConfigModel = models.StoreEmailConfig ?? model("StoreEmailConfig", storeEmailConfigSchema);
