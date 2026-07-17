import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const pageViewSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", default: null },
    sessionId: { type: String, required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    pageType: {
      type: String,
      enum: ["homepage", "product", "category", "cms_page", "search", "cart", "checkout", "order_success", "not_found", "landing", "other"],
      required: true,
    },
    url: { type: String, required: true },
    path: { type: String, required: true },
    title: { type: String, default: "" },
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    pageId: { type: Schema.Types.ObjectId, default: null },
    searchQuery: { type: String, default: "" },
    referrer: { type: String, default: "" },
    referrerType: { type: String, enum: ["direct", "search", "social", "email", "referral", "qr", "utm", "other"], default: "direct" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
    device: { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
    os: { type: String, default: "" },
    browser: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    timezone: { type: String, default: "" },
    language: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    isExit: { type: Boolean, default: false },
    isEntry: { type: Boolean, default: false },
  },
  { timestamps: true }
);

pageViewSchema.index({ storeId: 1, createdAt: -1 });
pageViewSchema.index({ storeId: 1, pageType: 1, createdAt: -1 });
pageViewSchema.index({ storeId: 1, productId: 1 });
pageViewSchema.index({ storeId: 1, categoryId: 1 });
pageViewSchema.index({ storeId: 1, visitorId: 1 });
pageViewSchema.index({ storeId: 1, sessionId: 1 });
pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export type PageViewDocument = InferSchemaType<typeof pageViewSchema>;
export const PageViewModel = models.PageView ?? model("PageView", pageViewSchema);
