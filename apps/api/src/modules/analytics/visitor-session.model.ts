import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const visitorSessionSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", default: null },
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true },
    isNewVisitor: { type: Boolean, default: true },
    isReturning: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 },
    isBounce: { type: Boolean, default: true },
    pageViews: { type: Number, default: 1 },
    entryPage: { type: String, default: "" },
    exitPage: { type: String, default: "" },
    referrer: { type: String, default: "" },
    referrerType: { type: String, enum: ["direct", "search", "social", "email", "referral", "qr", "utm", "other"], default: "direct" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
    utmTerm: { type: String, default: "" },
    utmContent: { type: String, default: "" },
    device: { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
    os: { type: String, default: "" },
    browser: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    timezone: { type: String, default: "" },
    language: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

visitorSessionSchema.index({ storeId: 1, startedAt: -1 });
visitorSessionSchema.index({ storeId: 1, visitorId: 1 });
visitorSessionSchema.index({ storeId: 1, isActive: 1 });
visitorSessionSchema.index({ sessionId: 1 }, { unique: true });
visitorSessionSchema.index({ storeId: 1, isReturning: 1 });
visitorSessionSchema.index({ createdAt: -1 });
visitorSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export type VisitorSessionDocument = InferSchemaType<typeof visitorSessionSchema>;
export const VisitorSessionModel = models.VisitorSession ?? model("VisitorSession", visitorSessionSchema);
