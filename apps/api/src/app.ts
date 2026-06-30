import express, { type Express } from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";
import dotenv from "dotenv";
import path from "path";
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
import { featureRouter } from "./modules/features/feature.route.js";
import { auditRouter } from "./modules/audit/audit.route.js";
import { getUploadRoot } from "./modules/media/providers/local-storage.provider.js";
import { subdomainDetector } from "./common/middleware/subdomain.middleware.js";
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

const allowedOriginPatterns: RegExp[] = [
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/,
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.localhost(:\d+)?$/i,
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.127\.0\.0\.1(:\d+)?$/i,
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.localhost\.com(:\d+)?$/i,
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.lvh\.me(:\d+)?$/i,
  new RegExp(`^https?://[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.${ROOT_HOSTNAME.replace(/\./g, "\\.")}(:\\d+)?$`, "i"),
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    for (const pattern of allowedOriginPatterns) {
      if (pattern.test(origin)) {
        callback(null, true);
        return;
      }
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`CORS origin blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-app-source", "x-forwarded-host"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export const app: Express = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(subdomainDetector);

app.use("/uploads", express.static(getUploadRoot()));

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "bornoland-api" });
});

app.get("/health/database", async (_request, response) => {
  try {
    const connection = await connectDatabase();
    response.json({ ok: true, connected: connection.readyState === 1 });
  } catch (error) {
    response.status(503).json({ ok: false, connected: false, message: error instanceof Error ? error.message : "Database unavailable" });
  }
});

app.use("/auth", authRouter);
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
app.use("/newsletter", newsletterRouter);
app.use("/contact", contactRouter);
app.use("/wishlist", wishlistRouter);
app.use("/payment-methods", paymentMethodRouter);
app.use("/delivery-zones", deliveryZoneRouter);
app.use("/cms", cmsRouter);
app.use("/categories", categoryRouter);
app.use("/subscription-payments", subscriptionPaymentRouter);
app.use("/subscriptions", subscriptionRouter);
app.use("/invoices", invoiceRouter);
app.use("/notifications", billingNotificationRouter);
app.use("/features", featureRouter);
app.use("/audit", auditRouter);

app.use(notFoundHandler);
app.use(errorHandler);
