import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";
const windowMs = 60 * 1000;

/**
 * Accurately extracts the client IP address considering reverse proxies
 * (Cloudflare, Nginx, Docker, etc.) so different users behind a proxy
 * do not incorrectly share a single rate-limiting bucket.
 */
function getClientIp(req: any): string {
  const cf = req.headers?.["cf-connecting-ip"];
  if (typeof cf === "string" && cf.trim()) return cf.trim();
  const real = req.headers?.["x-real-ip"];
  if (typeof real === "string" && real.trim()) return real.trim();
  const fwd = req.headers?.["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.trim()) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
}

const defaultKeyGenerator = (req: any) => ipKeyGenerator(getClientIp(req));

export const globalRateLimit = rateLimit({
  windowMs,
  max: Number(process.env.GLOBAL_RATE_LIMIT_MAX) || (isProd ? 300 : 2000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  validate: { xForwardedForHeader: false, default: true },
  skip: (req) => {
    const path = (req.path || req.originalUrl || "").toLowerCase();
    if (path === "/" || path === "/health" || path === "/api/health") return true;
    if (path.startsWith("/uploads")) return true;
    return false;
  },
  message: { success: false, message: "Too many requests, please try again later." },
});

export const authRateLimit = rateLimit({
  windowMs,
  // Configurable threshold, defaulting to 60/min in prod (1/sec on credential endpoints)
  // preventing brute force attacks while preventing false positives
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || (isProd ? 60 : 500),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  validate: { xForwardedForHeader: false, default: true },
  skip: (req) => {
    // 1. Never rate-limit safe read-only requests (e.g. GET /auth/me, GET /auth/google)
    if (req.method === "GET" || req.method === "OPTIONS" || req.method === "HEAD") {
      return true;
    }
    // 2. Exclude routine background session heartbeat & token refresh endpoints
    const path = (req.path || req.originalUrl || "").toLowerCase();
    if (path.includes("/me") || path.includes("/refresh") || path.includes("/logout")) {
      return true;
    }
    return false;
  },
  message: { success: false, message: "Too many authentication attempts, please try again later." },
});

export const writeRateLimit = rateLimit({
  windowMs,
  max: Number(process.env.WRITE_RATE_LIMIT_MAX) || (isProd ? 60 : 200),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  validate: { xForwardedForHeader: false, default: true },
  message: { success: false, message: "Too many write requests, please slow down." },
});

export const sensitiveWriteRateLimit = rateLimit({
  windowMs,
  max: Number(process.env.SENSITIVE_WRITE_RATE_LIMIT_MAX) || (isProd ? 20 : 100),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  validate: { xForwardedForHeader: false, default: true },
  message: { success: false, message: "Too many sensitive operations, please slow down." },
});

export const analyticsTrackRateLimit = rateLimit({
  windowMs,
  max: Number(process.env.ANALYTICS_RATE_LIMIT_MAX) || (isProd ? 120 : 600),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  validate: { xForwardedForHeader: false, default: true },
  message: { success: false, message: "Too many tracking requests, please slow down." },
});

export const newsletterRateLimit = rateLimit({
  windowMs,
  max: Number(process.env.NEWSLETTER_RATE_LIMIT_MAX) || (isProd ? 10 : 50),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: defaultKeyGenerator,
  validate: { xForwardedForHeader: false, default: true },
  message: { success: false, message: "Too many requests, please try again later." },
});
