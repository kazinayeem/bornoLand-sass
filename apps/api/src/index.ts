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
import { templateRouter } from "./routes/template.route.js";
import { builderRouter } from "./routes/builder.route.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const app = express();

const configuredOrigins = [
  process.env.WEB_URL,
  process.env.APP_URL,
  ...(process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [])
].filter((origin): origin is string => Boolean(origin));

const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients and same-origin server-to-server calls.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (configuredOrigins.includes(origin) || localhostRegex.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-app-source"]
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

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
app.use("/templates", templateRouter);
app.use("/builder", builderRouter);

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