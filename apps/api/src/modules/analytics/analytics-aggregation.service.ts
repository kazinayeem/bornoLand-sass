import { VisitorSessionModel } from "./visitor-session.model.js";
import { PageViewModel } from "./page-view.model.js";
import { DailyAnalyticModel } from "./daily-analytic.model.js";
import { MonthlyAnalyticModel } from "./monthly-analytic.model.js";
import { VisitorStatisticModel } from "./visitor-statistic.model.js";
import { TrafficSourceModel } from "./traffic-source.model.js";

export async function aggregateDailyStats(storeId: string, date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  // Sessions in period
  const sessions = await VisitorSessionModel.find({
    storeId,
    startedAt: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  const totalSessions = sessions.length;
  const totalVisits = sessions.reduce((sum, s) => sum + (s.pageViews || 1), 0);
  const uniqueVisitorIds = new Set(sessions.map((s) => s.visitorId));
  const uniqueVisitors = uniqueVisitorIds.size;
  const returningVisitors = sessions.filter((s) => s.isReturning).length;
  const newVisitors = sessions.filter((s) => s.isNewVisitor).length;
  const bouncedSessions = sessions.filter((s) => s.isBounce).length;
  const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
  const pagesPerSession = totalSessions > 0 ? Math.round((totalVisits / totalSessions) * 10) / 10 : 0;

  const desktopCount = sessions.filter((s) => s.device === "desktop").length;
  const mobileCount = sessions.filter((s) => s.device === "mobile").length;
  const tabletCount = sessions.filter((s) => s.device === "tablet").length;

  // Hourly breakdown
  const hourlyMap = new Map<number, { visits: number; unique: Set<string>; pageViews: number }>();
  for (let h = 0; h < 24; h++) {
    hourlyMap.set(h, { visits: 0, unique: new Set(), pageViews: 0 });
  }
  for (const session of sessions) {
    const h = new Date(session.startedAt).getHours();
    const entry = hourlyMap.get(h);
    if (entry) {
      entry.visits++;
      entry.unique.add(session.visitorId);
      entry.pageViews += session.pageViews || 1;
    }
  }
  const hourlyBreakdown = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
    hour,
    visits: data.visits,
    unique: data.unique.size,
    pageViews: data.pageViews,
  }));

  // Page views in period
  const pageViews = await PageViewModel.find({
    storeId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  // Countries
  const countryMap = new Map<string, number>();
  for (const pv of pageViews) {
    if (pv.country) {
      countryMap.set(pv.country, (countryMap.get(pv.country) || 0) + 1);
    }
  }
  const countries = Array.from(countryMap.entries()).map(([code, count]) => ({ code, count }));

  // Top products
  const productViews = new Map<string, { productId: string; name: string; views: number; addedToCart: number; purchased: number }>();
  for (const pv of pageViews) {
    if (pv.pageType === "product" && pv.productId) {
      const pid = pv.productId.toString();
      const existing = productViews.get(pid) || { productId: pid, name: pv.title || "Unknown", views: 0, addedToCart: 0, purchased: 0 };
      existing.views++;
      productViews.set(pid, existing);
    }
  }
  const topProducts = Array.from(productViews.values()).sort((a, b) => b.views - a.views).slice(0, 20);

  // Top categories
  const categoryViews = new Map<string, { categoryId: string; name: string; views: number }>();
  for (const pv of pageViews) {
    if (pv.pageType === "category" && pv.categoryId) {
      const cid = pv.categoryId.toString();
      const existing = categoryViews.get(cid) || { categoryId: cid, name: pv.title || "Unknown", views: 0 };
      existing.views++;
      categoryViews.set(cid, existing);
    }
  }
  const topCategories = Array.from(categoryViews.values()).sort((a, b) => b.views - a.views).slice(0, 20);

  // Top pages
  const pageViewCount = new Map<string, { url: string; title: string; views: number }>();
  for (const pv of pageViews) {
    const existing = pageViewCount.get(pv.url) || { url: pv.url, title: pv.title || "", views: 0 };
    existing.views++;
    pageViewCount.set(pv.url, existing);
  }
  const topPages = Array.from(pageViewCount.values()).sort((a, b) => b.views - a.views).slice(0, 20);

  // Top search queries
  const searchMap = new Map<string, number>();
  for (const pv of pageViews) {
    if (pv.pageType === "search" && pv.searchQuery) {
      searchMap.set(pv.searchQuery, (searchMap.get(pv.searchQuery) || 0) + 1);
    }
  }
  const topSearchQueries = Array.from(searchMap.entries()).map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count).slice(0, 20);

  // Traffic sources
  const sourceCounts = { direct: 0, search: 0, social: 0, email: 0, referral: 0, qr: 0, utm: 0, other: 0 };
  for (const session of sessions) {
    const type = session.referrerType as keyof typeof sourceCounts;
    if (type in sourceCounts) sourceCounts[type]++;
  }

  // Browsers
  const browserMap = new Map<string, number>();
  for (const session of sessions) {
    if (session.browser) browserMap.set(session.browser, (browserMap.get(session.browser) || 0) + 1);
  }
  const browsers = Array.from(browserMap.entries()).map(([name, count]) => ({ name, count }));

  // Operating systems
  const osMap = new Map<string, number>();
  for (const session of sessions) {
    if (session.os) osMap.set(session.os, (osMap.get(session.os) || 0) + 1);
  }
  const operatingSystems = Array.from(osMap.entries()).map(([name, count]) => ({ name, count }));

  await DailyAnalyticModel.updateOne(
    { storeId, date: startOfDay },
    {
      $set: {
        storeId,
        date: startOfDay,
        year,
        month,
        day,
        dayOfWeek: date.getDay(),
        totalVisits,
        uniqueVisitors,
        returningVisitors,
        newVisitors,
        totalPageViews: pageViews.length,
        totalSessions,
        bouncedSessions,
        bounceRate,
        avgSessionDuration,
        pagesPerSession,
        desktopCount,
        mobileCount,
        tabletCount,
        hourlyBreakdown,
        trafficSources: sourceCounts,
        countries,
        topProducts,
        topCategories,
        topPages,
        topSearchQueries,
        browsers,
        operatingSystems,
      },
    },
    { upsert: true }
  );

  // Update visitor statistic
  await VisitorStatisticModel.updateOne(
    { storeId, date: startOfDay },
    {
      $set: {
        storeId, date: startOfDay, year, month, day,
        totalVisits, uniqueVisitors, returningVisitors, newVisitors,
        totalPageViews: pageViews.length, totalSessions, bouncedSessions,
        bounceRate, avgSessionDuration, pagesPerSession,
        desktopCount, mobileCount, tabletCount,
        topProducts, topCategories, topPages, topSearchQueries,
        trafficSources: sourceCounts, countries, browsers, operatingSystems,
      },
    },
    { upsert: true }
  );

  return { uniqueVisitors, pageViews: pageViews.length, totalSessions };
}

export async function aggregateMonthlyStats(storeId: string, year: number, month: number) {
  const dailyRecords = await DailyAnalyticModel.find({
    storeId,
    year,
    month,
  }).lean();

  if (dailyRecords.length === 0) return null;

  const startOfMonth = new Date(year, month - 1, 1);

  const totals = {
    totalVisits: 0, uniqueVisitors: 0, returningVisitors: 0, newVisitors: 0,
    totalPageViews: 0, totalSessions: 0, bouncedSessions: 0,
    desktopCount: 0, mobileCount: 0, tabletCount: 0,
  };

  const sourceCounts = { direct: 0, search: 0, social: 0, email: 0, referral: 0, qr: 0, utm: 0, other: 0 };
  const countryMap = new Map<string, number>();
  const productMap = new Map<string, { productId: string; name: string; views: number }>();
  const categoryMap = new Map<string, { categoryId: string; name: string; views: number }>();
  const pageMap = new Map<string, { url: string; title: string; views: number }>();
  const browserMap = new Map<string, number>();
  const osMap = new Map<string, number>();

  for (const day of dailyRecords) {
    totals.totalVisits += day.totalVisits || 0;
    totals.uniqueVisitors += day.uniqueVisitors || 0;
    totals.returningVisitors += day.returningVisitors || 0;
    totals.newVisitors += day.newVisitors || 0;
    totals.totalPageViews += day.totalPageViews || 0;
    totals.totalSessions += day.totalSessions || 0;
    totals.bouncedSessions += day.bouncedSessions || 0;
    totals.desktopCount += day.desktopCount || 0;
    totals.mobileCount += day.mobileCount || 0;
    totals.tabletCount += day.tabletCount || 0;

    if (day.trafficSources) {
      for (const [key, val] of Object.entries(day.trafficSources)) {
        if (key in sourceCounts) sourceCounts[key as keyof typeof sourceCounts] += val as number;
      }
    }

    for (const c of day.countries || []) {
      countryMap.set(c.code, (countryMap.get(c.code) || 0) + c.count);
    }

    for (const p of day.topProducts || []) {
      const existing = productMap.get(p.name) || { productId: String(p.productId ?? ""), name: p.name, views: 0 };
      existing.views += p.views || 0;
      productMap.set(p.name, existing);
    }

    for (const cat of day.topCategories || []) {
      const existing = categoryMap.get(cat.name) || { categoryId: String(cat.categoryId ?? ""), name: cat.name, views: 0 };
      existing.views += cat.views || 0;
      categoryMap.set(cat.name, existing);
    }

    for (const pg of day.topPages || []) {
      const existing = pageMap.get(pg.url) || { url: pg.url, title: pg.title || "", views: 0 };
      existing.views += pg.views || 0;
      pageMap.set(pg.url, existing);
    }

    for (const b of day.browsers || []) {
      browserMap.set(b.name, (browserMap.get(b.name) || 0) + b.count);
    }

    for (const os of day.operatingSystems || []) {
      osMap.set(os.name, (osMap.get(os.name) || 0) + os.count);
    }
  }

  const totalSessions = totals.totalSessions || 1;
  const bounceRate = Math.round((totals.bouncedSessions / totalSessions) * 100);
  const pagesPerSession = Math.round((totals.totalPageViews / totalSessions) * 10) / 10;

  await MonthlyAnalyticModel.updateOne(
    { storeId, year, month },
    {
      $set: {
        storeId, date: startOfMonth, year, month,
        ...totals,
        bounceRate,
        pagesPerSession,
        avgSessionDuration: 0,
        trafficSources: sourceCounts,
        countries: Array.from(countryMap.entries()).map(([code, count]) => ({ code, count })),
        topProducts: Array.from(productMap.values()).sort((a, b) => b.views - a.views).slice(0, 20),
        topCategories: Array.from(categoryMap.values()).sort((a, b) => b.views - a.views).slice(0, 20),
        topPages: Array.from(pageMap.values()).sort((a, b) => b.views - a.views).slice(0, 20),
        browsers: Array.from(browserMap.entries()).map(([name, count]) => ({ name, count })),
        operatingSystems: Array.from(osMap.entries()).map(([name, count]) => ({ name, count })),
      },
    },
    { upsert: true }
  );

  return totals;
}

export async function runHourlyAggregation(storeId: string) {
  const now = new Date();
  await aggregateDailyStats(storeId, now);
}

export async function runDailyAggregation(storeId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  await aggregateDailyStats(storeId, now);
  await aggregateMonthlyStats(storeId, year, month);
}
