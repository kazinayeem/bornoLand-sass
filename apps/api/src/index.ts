import express from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";
import { connectDatabase } from "./config/database.js";
import { serverConfig } from "./config/server.js";
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
import { cmsRouter } from "./routes/cms.route.js";
import { categoryRouter } from "./routes/category.route.js";
import { CartModel } from "./models/cart.model.js";
import { StoreModel } from "./models/store.model.js";

import { subdomainDetector } from "./middleware/subdomain.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

const configuredOrigins = [
  serverConfig.FRONTEND_URL,
  serverConfig.APP_URL,
  ...(serverConfig.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [])
].filter((origin): origin is string => Boolean(origin));

const allowedOriginPatterns: RegExp[] = [
  new RegExp(`^https?://[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.${serverConfig.ROOT_DOMAIN.replace(/\./g, "\\.")}(:\\d+)?$`, "i"),
];

// In development, also accept common local dev host patterns like "anything.localhost:port"
if (serverConfig.isDev) {
  allowedOriginPatterns.push(new RegExp(`^https?://[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.localhost(:\\d+)?$`, "i"));
  allowedOriginPatterns.push(/^https?:\/\/localhost(:\d+)?$/i);
  // lvh.me and 127.0.0.1 variants sometimes used for subdomain testing
  allowedOriginPatterns.push(/^https?:\/\/127\.0\.0\.1(:\d+)?$/i);
  allowedOriginPatterns.push(/^https?:\/\/[\w-]+\.lvh\.me(:\d+)?$/i);
}

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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.use(subdomainDetector);

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

app.use(notFoundHandler);
app.use(errorHandler);

const port = serverConfig.PORT;

async function startServer() {
  try {
    const connection = await connectDatabase();
    await CartModel.syncIndexes();
    await StoreModel.syncIndexes();
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
