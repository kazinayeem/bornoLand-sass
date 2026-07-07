import { VisitorSessionModel } from "./visitor-session.model.js";
import { PageViewModel } from "./page-view.model.js";
import { DailyAnalyticModel } from "./daily-analytic.model.js";
import { MonthlyAnalyticModel } from "./monthly-analytic.model.js";
import { TrafficSourceModel } from "./traffic-source.model.js";
import { OrderModel } from "../orders/order.model.js";

export async function getStoreAnalyticsStats(storeId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfWeek = new Date(startOfToday.getTime() - now.getDay() * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    todaySessions, yesterdaySessions, weekSessions, monthSessions,
    lastMonthSessions, yearSessions, totalVisitors, activeSessions,
  ] = await Promise.all([
    VisitorSessionModel.countDocuments({ storeId, startedAt: { $gte: startOfToday } }),
    VisitorSessionModel.countDocuments({ storeId, startedAt: { $gte: startOfYesterday, $lt: startOfToday } }),
    VisitorSessionModel.countDocuments({ storeId, startedAt: { $gte: startOfWeek } }),
    VisitorSessionModel.countDocuments({ storeId, startedAt: { $gte: startOfMonth } }),
    VisitorSessionModel.countDocuments({ storeId, startedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    VisitorSessionModel.countDocuments({ storeId, startedAt: { $gte: startOfYear } }),
    VisitorSessionModel.distinct("visitorId", { storeId }),
    VisitorSessionModel.countDocuments({ storeId, isActive: true, updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
  ]);

  // Unique visitors per period
  const todayUnique = (await VisitorSessionModel.distinct("visitorId", { storeId, startedAt: { $gte: startOfToday } })).length;
  const yesterdayUnique = (await VisitorSessionModel.distinct("visitorId", { storeId, startedAt: { $gte: startOfYesterday, $lt: startOfToday } })).length;
  const monthUnique = (await VisitorSessionModel.distinct("visitorId", { storeId, startedAt: { $gte: startOfMonth } })).length;

  // Bounce rate
  const monthSessionsList = await VisitorSessionModel.find({ storeId, startedAt: { $gte: startOfMonth } }).lean();
  const bounced = monthSessionsList.filter((s) => s.isBounce).length;
  const bounceRate = monthSessionsList.length > 0 ? Math.round((bounced / monthSessionsList.length) * 100) : 0;

  // Avg session duration
  const totalDuration = monthSessionsList.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgSession = monthSessionsList.length > 0 ? Math.round(totalDuration / monthSessionsList.length) : 0;

  // Returning visitors
  const returning = monthSessionsList.filter((s) => s.isReturning).length;

  return {
    today: todaySessions,
    todayUnique,
    yesterday: yesterdaySessions,
    yesterdayUnique,
    week: weekSessions,
    month: monthSessions,
    monthUnique,
    lastMonth: lastMonthSessions,
    year: yearSessions,
    totalVisitors: totalVisitors.length,
    uniqueVisitors: monthUnique,
    returningVisitors: returning,
    avgSessionDuration: avgSession,
    bounceRate,
    liveVisitors: activeSessions,
  };
}

export async function getStoreVisitorCharts(storeId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [dailyRecords, monthlyRecords, pageViews, topProducts] = await Promise.all([
    DailyAnalyticModel.find({ storeId, date: { $gte: startOfMonth } }).sort({ date: 1 }).lean(),
    MonthlyAnalyticModel.find({ storeId, year: { $gte: now.getFullYear() - 1 } }).sort({ year: 1, month: 1 }).lean(),
    PageViewModel.find({ storeId, createdAt: { $gte: startOfMonth } }).sort({ createdAt: -1 }).limit(5000).lean(),
    PageViewModel.aggregate([
      { $match: { storeId: storeId as any, pageType: "product", productId: { $ne: null }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: "$productId", views: { $sum: 1 }, name: { $first: "$title" } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]),
  ]);

  // Visitors by day (this month)
  const visitorsByDay = dailyRecords.map((d) => ({
    date: d.date.toISOString().split("T")[0],
    visitors: d.uniqueVisitors || 0,
    pageViews: d.totalPageViews || 0,
    sessions: d.totalSessions || 0,
  }));

  // Visitors by month (last 12 months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const visitorsByMonth = monthlyRecords.map((m) => ({
    month: monthNames[(m.month || 1) - 1],
    year: m.year,
    label: `${monthNames[(m.month || 1) - 1]} ${m.year}`,
    visitors: m.uniqueVisitors || 0,
    pageViews: m.totalPageViews || 0,
    sessions: m.totalSessions || 0,
  }));

  // Visitors by hour (today)
  const todayDaily = dailyRecords.find((d) => {
    const dStr = d.date.toISOString().split("T")[0];
    const tStr = now.toISOString().split("T")[0];
    return dStr === tStr;
  });
  const visitorsByHour = todayDaily?.hourlyBreakdown?.map((h: { hour: number; unique?: number; pageViews?: number }) => ({
    hour: h.hour,
    visitors: h.unique || 0,
    pageViews: h.pageViews || 0,
  })) ?? Array.from({ length: 24 }, (_, i) => ({ hour: i, visitors: 0, pageViews: 0 }));

  // Top content
  const topProductsList = topProducts.map((p: any) => ({
    productId: p._id?.toString() || "",
    name: p.name || "Unknown",
    views: p.views || 0,
  }));

  // Top categories
  const topCategoriesList = dailyRecords.length > 0
    ? Array.from(
        dailyRecords.reduce((map, d) => {
          for (const cat of d.topCategories || []) {
            const key = String(cat.categoryId ?? cat.name);
            const existing = map.get(key) || { categoryId: String(cat.categoryId ?? ""), name: cat.name, views: 0 };
            existing.views += cat.views || 0;
            map.set(key, existing);
          }
          return map;
        }, new Map<string, { categoryId: string; name: string; views: number }>())
      ).sort((a, b) => b[1].views - a[1].views).slice(0, 10).map(([, v]) => v)
    : [];

  // Top pages
  const topPagesList = dailyRecords.length > 0
    ? Array.from(
        dailyRecords.reduce((map, d) => {
          for (const pg of d.topPages || []) {
            const existing = map.get(pg.url) || { url: pg.url, title: pg.title, views: 0 };
            existing.views += pg.views || 0;
            map.set(pg.url, existing);
          }
          return map;
        }, new Map<string, { url: string; title: string; views: number }>())
      ).sort((a, b) => b[1].views - a[1].views).slice(0, 10).map(([, v]) => v)
    : [];

  // Top search queries
  const topSearchesList = dailyRecords.length > 0
    ? Array.from(
        dailyRecords.reduce((map, d) => {
          for (const sq of d.topSearchQueries || []) {
            const existing = map.get(sq.query) || { query: sq.query, count: 0 };
            existing.count += sq.count || 0;
            map.set(sq.query, existing);
          }
          return map;
        }, new Map<string, { query: string; count: number }>())
      ).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([, v]) => v)
    : [];

  return {
    visitorsByDay,
    visitorsByMonth,
    visitorsByHour,
    topProducts: topProductsList,
    topCategories: topCategoriesList,
    topPages: topPagesList,
    topSearchQueries: topSearchesList,
  };
}

export async function getStoreTrafficSources(storeId: string) {
  return TrafficSourceModel.find({ storeId }).sort({ visits: -1 }).lean();
}

export async function getStoreDevices(storeId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sessions = await VisitorSessionModel.find({
    storeId,
    startedAt: { $gte: startOfMonth },
  }).lean();

  const desktopCount = sessions.filter((s) => s.device === "desktop").length;
  const mobileCount = sessions.filter((s) => s.device === "mobile").length;
  const tabletCount = sessions.filter((s) => s.device === "tablet").length;
  const total = desktopCount + mobileCount + tabletCount || 1;

  const browserMap = new Map<string, number>();
  const osMap = new Map<string, number>();
  const countryMap = new Map<string, number>();

  for (const s of sessions) {
    if (s.browser) browserMap.set(s.browser, (browserMap.get(s.browser) || 0) + 1);
    if (s.os) osMap.set(s.os, (osMap.get(s.os) || 0) + 1);
    if (s.country) countryMap.set(s.country, (countryMap.get(s.country) || 0) + 1);
  }

  return {
    devices: [
      { name: "Desktop", count: desktopCount, percentage: Math.round((desktopCount / total) * 100) },
      { name: "Mobile", count: mobileCount, percentage: Math.round((mobileCount / total) * 100) },
      { name: "Tablet", count: tabletCount, percentage: Math.round((tabletCount / total) * 100) },
    ],
    browsers: Array.from(browserMap.entries()).map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) })),
    operatingSystems: Array.from(osMap.entries()).map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) })),
    countries: Array.from(countryMap.entries()).map(([code, count]) => ({ code, count, percentage: Math.round((count / total) * 100) })),
  };
}

export async function getStoreTopContent(storeId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Most viewed products
  const topProducts = await PageViewModel.aggregate([
    { $match: { storeId: storeId as any, pageType: "product", productId: { $ne: null }, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: "$productId", views: { $sum: 1 }, name: { $first: "$title" } } },
    { $sort: { views: -1 } },
    { $limit: 20 },
  ]);

  // Most viewed categories
  const topCategories = await PageViewModel.aggregate([
    { $match: { storeId: storeId as any, pageType: "category", categoryId: { $ne: null }, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: "$categoryId", views: { $sum: 1 }, name: { $first: "$title" } } },
    { $sort: { views: -1 } },
    { $limit: 20 },
  ]);

  // Most viewed pages
  const topPages = await PageViewModel.aggregate([
    { $match: { storeId: storeId as any, pageType: { $in: ["cms_page", "landing", "other"] }, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: "$url", views: { $sum: 1 }, title: { $first: "$title" }, path: { $first: "$path" } } },
    { $sort: { views: -1 } },
    { $limit: 20 },
  ]);

  // Most searched keywords
  const topSearches = await PageViewModel.aggregate([
    { $match: { storeId: storeId as any, pageType: "search", searchQuery: { $ne: "" }, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: "$searchQuery", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  return {
    topProducts: topProducts.map((p: any) => ({ productId: p._id?.toString() || "", name: p.name || "Unknown", views: p.views || 0 })),
    topCategories: topCategories.map((c: any) => ({ categoryId: c._id?.toString() || "", name: c.name || "Unknown", views: c.views || 0 })),
    topPages: topPages.map((p: any) => ({ url: p._id || "", title: p.title || "", path: p.path || "", views: p.views || 0 })),
    topSearches: topSearches.map((s: any) => ({ query: s._id || "", count: s.count || 0 })),
  };
}

export async function getStoreCities(storeId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const cities = await PageViewModel.aggregate([
    { $match: { storeId: storeId as any, city: { $ne: "", $exists: true }, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: { city: "$city", country: "$country" }, count: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
    { $project: { _id: 0, city: "$_id.city", country: "$_id.country", count: 1, uniqueVisitors: { $size: "$visitors" } } },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);

  return cities;
}

export async function getStoreConversion(storeId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [sessions, pageViewsByType, orders] = await Promise.all([
    VisitorSessionModel.countDocuments({ storeId, startedAt: { $gte: startOfMonth } }),
    PageViewModel.aggregate([
      { $match: { storeId: storeId as any, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: "$pageType", count: { $sum: 1 }, unique: { $addToSet: "$visitorId" } } },
    ]),
    OrderModel.countDocuments({
      storeId,
      createdAt: { $gte: startOfMonth },
    }),
  ]);

  const pageTypeMap: Record<string, { count: number; unique: number }> = {};
  for (const pt of pageViewsByType) {
    pageTypeMap[String(pt._id ?? "other")] = { count: pt.count || 0, unique: (pt.unique ?? []).length };
  }

  return {
    totalSessions: sessions,
    totalPageViews: pageViewsByType.reduce((s: number, p: any) => s + (p.count || 0), 0),
    homepageViews: pageTypeMap["homepage"]?.count ?? 0,
    homepageUnique: pageTypeMap["homepage"]?.unique ?? 0,
    productViews: pageTypeMap["product"]?.count ?? 0,
    productUnique: pageTypeMap["product"]?.unique ?? 0,
    categoryViews: pageTypeMap["category"]?.count ?? 0,
    cartViews: pageTypeMap["cart"]?.count ?? 0,
    checkoutViews: pageTypeMap["checkout"]?.count ?? 0,
    orderSuccessViews: pageTypeMap["order_success"]?.count ?? 0,
    searchViews: pageTypeMap["search"]?.count ?? 0,
    totalOrders: orders,
    conversionRate: sessions > 0 ? Number(((orders / sessions) * 100).toFixed(2)) : 0,
    cartConversion: pageTypeMap["product"]?.count ? Number((((pageTypeMap["cart"]?.count ?? 0) / (pageTypeMap["product"]?.count ?? 1)) * 100).toFixed(2)) : 0,
    checkoutConversion: pageTypeMap["cart"]?.count ? Number((((pageTypeMap["checkout"]?.count ?? 0) / (pageTypeMap["cart"]?.count ?? 1)) * 100).toFixed(2)) : 0,
    orderConversion: pageTypeMap["checkout"]?.count ? Number((((pageTypeMap["order_success"]?.count ?? 0) / (pageTypeMap["checkout"]?.count ?? 1)) * 100).toFixed(2)) : 0,
  };
}

export async function getPlatformAnalyticsOverview() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalSessions, todaySessions, monthSessions, totalPageViews, todayPageViews, monthPageViews, storeVisitorCounts] = await Promise.all([
    VisitorSessionModel.countDocuments({}),
    VisitorSessionModel.countDocuments({ startedAt: { $gte: startOfToday } }),
    VisitorSessionModel.countDocuments({ startedAt: { $gte: startOfMonth } }),
    PageViewModel.countDocuments({}),
    PageViewModel.countDocuments({ createdAt: { $gte: startOfToday } }),
    PageViewModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
    VisitorSessionModel.aggregate([
      { $group: { _id: "$storeId", visits: { $sum: 1 }, uniqueVisitors: { $addToSet: "$visitorId" } } },
      { $project: { storeId: "$_id", visits: 1, uniqueVisitors: { $size: "$uniqueVisitors" } } },
      { $sort: { visits: -1 } },
      { $limit: 20 },
    ]),
  ]);

  const totalUniqueVisitors = (await VisitorSessionModel.distinct("visitorId", {})).length;

  // Top products across platform
  const topPlatformProducts = await PageViewModel.aggregate([
    { $match: { pageType: "product", productId: { $ne: null }, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: "$productId", views: { $sum: 1 }, name: { $first: "$title" } } },
    { $sort: { views: -1 } },
    { $limit: 10 },
  ]);

  // Top countries
  const topCountries = await PageViewModel.aggregate([
    { $match: { country: { $ne: "" } } },
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Top referrers
  const topReferrers = await TrafficSourceModel.aggregate([
    { $group: { _id: "$source", visits: { $sum: "$visits" } } },
    { $sort: { visits: -1 } },
    { $limit: 10 },
  ]);

  // Traffic growth (month over month)
  const monthlyGrowth = await MonthlyAnalyticModel.aggregate([
    { $sort: { year: -1, month: -1 } },
    { $limit: 13 },
    { $group: { _id: { year: "$year", month: "$month" }, visitors: { $sum: "$uniqueVisitors" }, pageViews: { $sum: "$totalPageViews" }, sessions: { $sum: "$totalSessions" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    totalSessions,
    totalPageViews,
    totalUniqueVisitors,
    todaySessions,
    todayPageViews,
    monthSessions,
    monthPageViews,
    storeVisitorCounts: storeVisitorCounts.map((s: any) => ({
      storeId: s.storeId?.toString() || "",
      visits: s.visits || 0,
      uniqueVisitors: s.uniqueVisitors || 0,
    })),
    topPlatformProducts: topPlatformProducts.map((p: any) => ({ productId: p._id?.toString() || "", name: p.name || "Unknown", views: p.views || 0 })),
    topCountries: topCountries.map((c: any) => ({ code: c._id || "", count: c.count || 0 })),
    topReferrers: topReferrers.map((r: any) => ({ source: r._id || "", visits: r.visits || 0 })),
    monthlyGrowth: monthlyGrowth.map((m: any) => ({
      year: m._id.year,
      month: m._id.month,
      visitors: m.visitors || 0,
      pageViews: m.pageViews || 0,
      sessions: m.sessions || 0,
    })),
    activeStoresWithVisitors: storeVisitorCounts.length,
  };
}
