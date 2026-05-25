import express from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "./config/database.js";
import { authRouter } from "./routes/auth.route.js";
import { adminRouter } from "./routes/admin.route.js";
import { billingRouter } from "./routes/billing.route.js";
import { tenantRouter } from "./routes/tenant.route.js";
import { pageRouter } from "./routes/page.route.js";
import { storeRouter } from "./routes/store.route.js";
import { planRouter } from "./routes/plan.route.js";
import { templateRouter } from "./routes/template.route.js";
import { builderRouter } from "./routes/builder.route.js";
import { publicRouter } from "./routes/public.route.js";
import { productRouter } from "./routes/product.route.js";
import { customerRouter } from "./routes/customer.route.js";
import { cartRouter } from "./routes/cart.route.js";
import { orderRouter } from "./routes/order.route.js";
import { newsletterRouter } from "./routes/newsletter.route.js";
import { contactRouter } from "./routes/contact.route.js";
import { wishlistRouter } from "./routes/wishlist.route.js";
import { paymentMethodRouter } from "./routes/payment-method.route.js";
import { deliveryZoneRouter } from "./routes/delivery-zone.route.js";
import { resolveProductByHostController } from "./controllers/public.controller.js";
import { subdomainDetector } from "./middleware/subdomain.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const app = express();

// ── CORS configuration ──────────────────────────────────────────

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "bornoland.com";

const configuredOrigins = [
  process.env.WEB_URL,
  process.env.APP_URL,
  ...(process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [])
].filter((origin): origin is string => Boolean(origin));

/**
 * Dynamic origin validator that supports:
 *   - Bare localhost / 127.0.0.1  (e.g. http://localhost:3000)
 *   - Subdomain localhost          (e.g. http://nayeem.localhost:3000)
 *   - Subdomain localhost.com      (e.g. http://nayeem.localhost.com:3002)
 *   - Subdomain lvh.me             (e.g. http://nayeem.lvh.me:3000)
 *   - Subdomain 127.0.0.1          (e.g. http://nayeem.127.0.0.1:3000)
 *   - Subdomain of ROOT_DOMAIN     (e.g. https://nayeem.bornoland.com)
 *   - Any origin listed in env vars CORS_ORIGINS, WEB_URL, APP_URL
 */
const allowedOriginPatterns: RegExp[] = [
  // Bare localhost / 127.0.0.1 / 0.0.0.0 (no subdomain)
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/,
  // Subdomain of localhost (e.g. http://nayeem.localhost:3000)
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.localhost(:\d+)?$/i,
  // Subdomain of 127.0.0.1
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.127\.0\.0\.1(:\d+)?$/i,
  // Subdomain of localhost.com (for /etc/hosts approach)
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.localhost\.com(:\d+)?$/i,
  // Subdomain of lvh.me
  /^https?:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.lvh\.me(:\d+)?$/i,
  // Production subdomain of ROOT_DOMAIN
  new RegExp(`^https?://[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.${ROOT_DOMAIN.replace(/\./g, "\\.")}(:\\d+)?$`, "i"),
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests (no origin)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check hardcoded configured origins first
    if (configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Check dynamic patterns
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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

// ── Subdomain detection (applied globally) ──────────────────────
app.use(subdomainDetector);

// ── Health ──────────────────────────────────────────────────────
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

// ── Routes ──────────────────────────────────────────────────────
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
app.get("/products/:slug", resolveProductByHostController);
app.use("/customer", customerRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/newsletter", newsletterRouter);
app.use("/contact", contactRouter);
app.use("/wishlist", wishlistRouter);
app.use("/payment-methods", paymentMethodRouter);
app.use("/delivery-zones", deliveryZoneRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`BornoLand API listening on port ${port}`);
      console.log("MongoDB connection established");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

void startServer();