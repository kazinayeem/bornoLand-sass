import { VisitorSessionModel } from "./visitor-session.model.js";
import { PageViewModel } from "./page-view.model.js";
import { TrafficSourceModel } from "./traffic-source.model.js";

type PageType = "homepage" | "product" | "category" | "cms_page" | "search" | "cart" | "checkout" | "order_success" | "not_found" | "landing" | "other";
type DeviceType = "desktop" | "mobile" | "tablet";
type ReferrerType = "direct" | "search" | "social" | "email" | "referral" | "qr" | "utm" | "other";

interface TrackPageViewInput {
  storeId: string;
  tenantId?: string;
  pageType: PageType;
  url: string;
  path: string;
  title?: string;
  productId?: string;
  categoryId?: string;
  pageId?: string;
  searchQuery?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  ip?: string;
  userAgent?: string;
  language?: string;
  visitorId?: string;
  sessionId?: string;
}

interface TrackSessionEndInput {
  sessionId: string;
  storeId: string;
  exitPage: string;
  duration: number;
}

function detectDevice(ua: string): DeviceType {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function detectOS(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os|macintosh/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

function detectReferrerType(referrer: string, utmSource?: string): ReferrerType {
  if (utmSource) return "utm";
  if (!referrer) return "direct";
  const ref = referrer.toLowerCase();
  if (/google|bing|yahoo|duckduckgo|baidu/i.test(ref)) return "search";
  if (/facebook|instagram|twitter|x\.com|linkedin|tiktok|youtube|pinterest|snapchat|reddit/i.test(ref)) return "social";
  if (/mail\.|outlook|gmail|yahoo mail/i.test(ref)) return "email";
  if (/qr|scan/i.test(ref)) return "qr";
  return "referral";
}

function detectSourceFromReferrer(referrer: string): string {
  if (!referrer) return "direct";
  const ref = referrer.toLowerCase();
  if (ref.includes("google")) return "Google Search";
  if (ref.includes("facebook")) return "Facebook";
  if (ref.includes("instagram")) return "Instagram";
  if (ref.includes("youtube")) return "YouTube";
  if (ref.includes("tiktok")) return "TikTok";
  if (ref.includes("linkedin")) return "LinkedIn";
  if (ref.includes("twitter") || ref.includes("x.com")) return "Twitter";
  if (ref.includes("pinterest")) return "Pinterest";
  if (ref.includes("bing")) return "Bing";
  if (ref.includes("yahoo")) return "Yahoo";
  if (ref.includes("duckduckgo")) return "DuckDuckGo";
  return referrer.replace(/^https?:\/\//, "").split("/")[0] || "referral";
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function trackPageView(input: TrackPageViewInput) {
  const { storeId, tenantId, pageType, url, path, title, productId, categoryId, pageId, searchQuery, referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, ip, userAgent, language } = input;

  const visitorId = input.visitorId || generateId();
  const sessionId = input.sessionId || generateId();
  const ua = userAgent || "";
  const device = detectDevice(ua);
  const browser = detectBrowser(ua);
  const os = detectOS(ua);
  const refType = detectReferrerType(referrer || "", utmSource);
  const source = detectSourceFromReferrer(referrer || "");

  // Upsert session
  const now = new Date();
  const existingSession = sessionId !== input.sessionId ? null : await VisitorSessionModel.findOne({ sessionId });

  if (existingSession) {
    await VisitorSessionModel.updateOne(
      { sessionId },
      {
        $set: {
          exitPage: url,
          referrer: referrer || "",
          referrerType: refType,
          utmSource: utmSource || "",
          utmMedium: utmMedium || "",
          utmCampaign: utmCampaign || "",
          utmTerm: utmTerm || "",
          utmContent: utmContent || "",
          device,
          os,
          browser,
          country: "",
          city: "",
          timezone: "",
          language: language || "",
          ip: ip || "",
          userAgent: ua,
          isBounce: false,
        },
        $inc: { pageViews: 1 },
      }
    );
  } else {
    await VisitorSessionModel.create({
      storeId,
      tenantId,
      visitorId,
      sessionId,
      isNewVisitor: true,
      isReturning: false,
      startedAt: now,
      entryPage: url,
      exitPage: url,
      referrer: referrer || "",
      referrerType: refType,
      utmSource: utmSource || "",
      utmMedium: utmMedium || "",
      utmCampaign: utmCampaign || "",
      utmTerm: utmTerm || "",
      utmContent: utmContent || "",
      device,
      os,
      browser,
      language: language || "",
      ip: ip || "",
      userAgent: ua,
      isActive: true,
    });
  }

  // Check if returning visitor
  const existingVisitorSessions = await VisitorSessionModel.countDocuments({ storeId, visitorId });
  if (existingVisitorSessions > 1) {
    await VisitorSessionModel.updateOne({ sessionId }, { $set: { isReturning: true, isNewVisitor: false } });
  }

  // Create page view
  await PageViewModel.create({
    storeId,
    tenantId,
    sessionId,
    visitorId,
    pageType,
    url,
    path,
    title: title || "",
    productId: productId || null,
    categoryId: categoryId || null,
    pageId: pageId || null,
    searchQuery: searchQuery || "",
    referrer: referrer || "",
    referrerType: refType,
    utmSource: utmSource || "",
    utmMedium: utmMedium || "",
    utmCampaign: utmCampaign || "",
    device,
    os,
    browser,
    language: language || "",
    ip: ip || "",
    userAgent: ua,
    isEntry: existingSession === null,
    isExit: false,
  });

  // Update traffic source
  if (source) {
    await TrafficSourceModel.updateOne(
      { storeId, source },
      {
        $setOnInsert: { storeId, tenantId, source, type: refType, medium: utmMedium || "", campaign: utmCampaign || "" },
        $inc: { visits: 1, pageViews: 1 },
        $set: { lastSeen: now },
      },
      { upsert: true }
    );
  }

  return { visitorId, sessionId, device, browser, os, isNew: existingSession === null };
}

export async function trackSessionEnd(input: TrackSessionEndInput) {
  const { sessionId, storeId, exitPage, duration } = input;
  await VisitorSessionModel.updateOne(
    { sessionId, storeId },
    { $set: { endedAt: new Date(), exitPage, duration, isActive: false } }
  );
}

export async function getLiveVisitors(storeId: string) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const sessions = await VisitorSessionModel.find({
    storeId,
    isActive: true,
    updatedAt: { $gte: fiveMinutesAgo },
  }).lean();

  return sessions;
}

export async function getLiveVisitorsCount(storeId: string): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return VisitorSessionModel.countDocuments({
    storeId,
    isActive: true,
    updatedAt: { $gte: fiveMinutesAgo },
  });
}
