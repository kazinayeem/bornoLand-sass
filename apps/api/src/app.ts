import express, { type Express } from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import mongoose from "mongoose";
import pino from "pino";
import pinoHttpModule from "pino-http";
import { connectDatabase } from "./common/database/connection.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { adminRouter } from "./modules/settings/admin.route.js";
import { billingRouter } from "./modules/subscriptions/billing.route.js";
import { tenantRouter } from "./modules/workspaces/tenant.route.js";
import { pageRouter } from "./modules/stores/page.route.js";
import { storeRouter } from "./modules/stores/store.route.js";
import { planRouter } from "./modules/plans/plan.route.js";
import { templateRouter } from "./modules/themes/template.route.js";
import { builderRouter } from "./modules/builder/builder.route.js";
import { publicRouter } from "./modules/cms/public.route.js";
import { productRouter } from "./modules/products/product.route.js";
import { customerRouter } from "./modules/customers/customer.route.js";
import { cartRouter } from "./modules/cart/cart.route.js";
import { orderRouter } from "./modules/orders/order.route.js";
import { newsletterRouter } from "./modules/notifications/newsletter.route.js";
import { contactRouter } from "./modules/notifications/contact.route.js";
import { wishlistRouter } from "./modules/cart/wishlist.route.js";
import { paymentMethodRouter } from "./modules/payments/payment-method.route.js";
import { deliveryZoneRouter } from "./modules/delivery/delivery-zone.route.js";
import { cmsRouter } from "./modules/cms/cms.route.js";
import { categoryRouter } from "./modules/categories/category.route.js";
import { subscriptionPaymentRouter } from "./modules/payments/subscription-payment.route.js";
import { subscriptionRouter } from "./modules/subscriptions/subscription.route.js";
import { invoiceRouter } from "./modules/subscriptions/invoice.route.js";
import { billingNotificationRouter } from "./modules/notifications/billing-notification.route.js";
import { storePageRouter } from "./modules/pages/store-page.route.js";
import { previewRouter } from "./modules/pages/preview.route.js";
import { navigationRouter } from "./modules/navigation/navigation.route.js";
import { featureRouter } from "./modules/features/feature.route.js";
import { auditRouter } from "./modules/audit/audit.route.js";
import { analyticsRouter } from "./modules/analytics/analytics.route.js";
import { adminAnalyticsRouter } from "./modules/analytics/admin-analytics.route.js";
import { reportRouter } from "./modules/reports/report.route.js";
import { profileRouter } from "./modules/profile/profile.route.js";
import { globalSectionRouter } from "./modules/builder/global-section.route.js";
import { builderTemplateRouter } from "./modules/builder/builder-template.route.js";
import { getUploadRoot } from "./modules/media/providers/local-storage.provider.js";
import { subdomainDetector } from "./common/middleware/subdomain.middleware.js";
import { globalRateLimit, authRateLimit, analyticsTrackRateLimit, newsletterRateLimit } from "./common/middleware/rate-limit.middleware.js";
import { storeEmailRouter } from "./modules/email/store-email.route.js";
import { errorHandler, notFoundHandler } from "./common/middleware/error.middleware.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
const ROOT_HOSTNAME = ROOT_DOMAIN.includes(":") ? ROOT_DOMAIN.split(":")[0] : ROOT_DOMAIN;

const configuredOrigins = [
  process.env.WEB_URL,
  process.env.APP_URL,
  ...(process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [])
].filter((origin): origin is string => Boolean(origin));

/**
 * Origins allowed via pattern (credentials:true requires echoing a specific Origin —
 * never use `*`). Keep localhost / lvh.me / ROOT_HOSTNAME for local + real domains.
 * Also allow IP-based wildcard DNS used for EC2 testing without a custom domain:
 *   http://nayeem.13.201.93.77.nip.io:3000
 *   http://demo.13-201-93-77.sslip.io:3000
 */
const allowedOriginPatterns: RegExp[] = [
  // Loopback apex (with optional port)
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/,
  // store.localhost:3000 — local multi-tenant
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.localhost(:\d+)?$/i,
  // store.127.0.0.1:3000
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.127\.0\.0\.1(:\d+)?$/i,
  // store.localhost.com (legacy local wildcard)
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.localhost\.com(:\d+)?$/i,
  // store.lvh.me
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.lvh\.me(:\d+)?$/i,
  // nip.io — optional single tenant label + dotted IPv4 apex (with optional port)
  // e.g. http://13.201.93.77.nip.io:3000 or http://nayeem.13.201.93.77.nip.io:3000
  /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)?(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\.nip\.io(?::\d+)?$/i,
  // sslip.io — same dotted-IP form as nip.io
  /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)?(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\.sslip\.io(?::\d+)?$/i,
  // sslip.io — dashed IPv4 form (e.g. nayeem.13-201-93-77.sslip.io:3000)
  /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)?(?:25[0-5]|2[0-4]\d|1?\d?\d)-(?:25[0-5]|2[0-4]\d|1?\d?\d)-(?:25[0-5]|2[0-4]\d|1?\d?\d)-(?:25[0-5]|2[0-4]\d|1?\d?\d)\.sslip\.io(?::\d+)?$/i,
];

// Real production domain: apex, www, and tenant subdomains
// e.g. https://bornosoft.site | https://www.bornosoft.site | https://nayeem.bornosoft.site
if (ROOT_HOSTNAME && ROOT_HOSTNAME !== "localhost" && ROOT_HOSTNAME !== "127.0.0.1") {
  const escapedRoot = ROOT_HOSTNAME.replace(/\./g, "\\.");
  // Apex (marketing landing) — was missing before; only subdomain pattern existed
  allowedOriginPatterns.push(new RegExp(`^https?://${escapedRoot}(?::\\d+)?$`, "i"));
  // www apex (also marketing, never a tenant)
  allowedOriginPatterns.push(new RegExp(`^https?://www\\.${escapedRoot}(?::\\d+)?$`, "i"));
  // Tenant / app subdomains
  allowedOriginPatterns.push(
    new RegExp(
      `^https?://[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.${escapedRoot}(?::\\d+)?$`,
      "i",
    ),
  );
} else if (ROOT_HOSTNAME) {
  // localhost:3000 style root — subdomain tenants only (apex covered by loopback patterns)
  allowedOriginPatterns.push(
    new RegExp(
      `^https?://[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.${ROOT_HOSTNAME.replace(/\./g, "\\.")}(?::\\d+)?$`,
      "i",
    ),
  );
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Same-origin / non-browser / server-to-server (no Origin header)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Explicit allow-list from WEB_URL / APP_URL / CORS_ORIGINS
    if (configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    for (const pattern of allowedOriginPatterns) {
      if (pattern.test(origin)) {
        // Reflect the request Origin (required for credentials: true)
        callback(null, true);
        return;
      }
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`CORS origin blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-app-source",
    "x-forwarded-host",
    "x-store-slug",
    "x-session-id",
  ],
  // Handle OPTIONS here so browsers get Access-Control-Allow-* on preflight
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export const app: Express = express();

app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://picsum.photos", "https://placehold.co"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(globalRateLimit);
app.use(subdomainDetector);

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
const pinoHttp = (pinoHttpModule as any).default ?? (pinoHttpModule as any).pinoHttp ?? pinoHttpModule;
app.use(pinoHttp({ logger }));

app.use((req, res, next) => {
  (req as any).requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", (req as any).requestId);
  next();
});

app.use("/uploads", express.static(getUploadRoot()));

app.get(["/health", "/api/health"], (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "unhealthy",
    service: "bornoland-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbStatus,
      redis: "unknown",
    },
    memory: process.memoryUsage(),
  });
});

app.use("/auth", authRateLimit, authRouter);
app.use("/profile", profileRouter);
app.use("/tenants", tenantRouter);
app.use("/pages", pageRouter);
app.use("/admin", adminRouter);
app.use("/billing", billingRouter);
app.use("/stores", storeRouter);
app.use("/plans", planRouter);
app.use("/templates", templateRouter);
app.use("/builder", builderRouter);
app.use("/public", publicRouter);
app.use("/products", productRouter);
app.use("/customer", customerRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/newsletter", newsletterRateLimit, newsletterRouter);
app.use("/contact", newsletterRateLimit, contactRouter);
app.use("/wishlist", wishlistRouter);
app.use("/payment-methods", paymentMethodRouter);
app.use("/delivery-zones", deliveryZoneRouter);
app.use("/cms", cmsRouter);
app.use("/categories", categoryRouter);
app.use("/subscription-payments", subscriptionPaymentRouter);
app.use("/subscriptions", subscriptionRouter);
app.use("/invoices", invoiceRouter);
app.use("/notifications", billingNotificationRouter);
app.use("/store-pages", storePageRouter);
app.use("/global-sections", globalSectionRouter);
app.use("/builder-templates", builderTemplateRouter);
app.use("/preview", previewRouter);
app.use("/navigation", navigationRouter);
app.use("/features", featureRouter);
app.use("/audit", auditRouter);
app.use("/analytics", analyticsRouter);
app.use("/admin/analytics", adminAnalyticsRouter);
app.use("/reports", reportRouter);
app.use("/stores", storeEmailRouter);

app.use(notFoundHandler);
app.use(errorHandler);
