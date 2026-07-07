import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const visitorStatisticSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", default: null },
    date: { type: Date, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    day: { type: Number, required: true },
    totalVisits: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    returningVisitors: { type: Number, default: 0 },
    newVisitors: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    bouncedSessions: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
    pagesPerSession: { type: Number, default: 0 },
    desktopCount: { type: Number, default: 0 },
    mobileCount: { type: Number, default: 0 },
    tabletCount: { type: Number, default: 0 },
    topProducts: [{ productId: { type: Schema.Types.ObjectId, ref: "Product" }, name: String, views: Number }],
    topCategories: [{ categoryId: { type: Schema.Types.ObjectId, ref: "Category" }, name: String, views: Number }],
    topPages: [{ url: String, title: String, views: Number }],
    topSearchQueries: [{ query: String, count: Number }],
    trafficSources: {
      direct: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      qr: { type: Number, default: 0 },
      utm: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    countries: [{ code: String, count: Number }],
    browsers: [{ name: String, count: Number }],
    operatingSystems: [{ name: String, count: Number }],
  },
  { timestamps: true }
);

visitorStatisticSchema.index({ storeId: 1, date: -1 }, { unique: true });
visitorStatisticSchema.index({ storeId: 1, year: 1, month: 1, day: 1 });

export type VisitorStatisticDocument = InferSchemaType<typeof visitorStatisticSchema>;
export const VisitorStatisticModel = models.VisitorStatistic ?? model("VisitorStatistic", visitorStatisticSchema);
