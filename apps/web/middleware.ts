import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

// ── Constants ─────────────────────────────────────────────────────

const PUBLIC_FILE = /\.(.*)$/;
const authSecret = process.env.JWT_SECRET ?? "bornoland-dev-secret";
const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "bornoland.session";
const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "bornoland.com";

// Development root domains that resolve to localhost
const DEV_ROOT_DOMAINS = new Set([
  "localhost.com",
  "lvh.me",
  "localhost",
  "127.0.0.1",
]);

// Routes that should never be rewritten to /site/
const APP_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
  "/api",
]);

// ── JWT helpers ───────────────────────────────────────────────────

const secretBytes = new TextEncoder().encode(authSecret);

type SessionToken = {
  role?: string;
  userId?: string;
  tenantId?: string;
};

async function verifySessionToken(token: string): Promise<SessionToken | null> {
  try {
    const result = await jwtVerify(token, secretBytes);
    return result.payload as SessionToken;
  } catch {
    return null;
  }
}

// ── Subdomain helpers ─────────────────────────────────────────────

/**
 * Extracts the subdomain slug from a hostname.
 *
 * Examples:
 *   "test.localhost.com" → "test"
 *   "demo.lvh.me"        → "demo"
 *   "test.bornoland.com"  → "test"
 *   "localhost.com"       → null
 *   "localhost"           → null
 */
function getSubdomain(hostname: string): string | null {
  const lower = hostname.toLowerCase();

  // Bare localhost / 127.0.0.1 — no subdomain
  if (lower === "localhost" || lower === "127.0.0.1" || lower === "0.0.0.0") {
    return null;
  }

  // Check known dev domains
  for (const dev of DEV_ROOT_DOMAINS) {
    if (lower === dev) return null; // exact match, no subdomain
    if (lower.endsWith(`.${dev}`)) {
      const prefix = lower.slice(0, -(dev.length + 1));
      if (prefix && !prefix.includes(".")) return prefix;
      return null; // multi-level subdomain like a.b.localhost.com
    }
  }

  // Production: check ROOT_DOMAIN
  if (lower.endsWith(`.${ROOT_DOMAIN}`)) {
    const prefix = lower.slice(0, -(ROOT_DOMAIN.length + 1));
    if (prefix && !prefix.includes(".")) return prefix;
  }

  return null;
}

/**
 * Returns the base domain (without subdomain) from a hostname.
 * Used for redirecting to the main app.
 *
 * "test.localhost.com" → "localhost.com"
 * "demo.lvh.me"        → "lvh.me"
 * "app.bornoland.com"   → "bornoland.com"
 */
function getBaseDomain(hostname: string): string {
  const lower = hostname.toLowerCase();

  for (const dev of DEV_ROOT_DOMAINS) {
    if (lower.endsWith(`.${dev}`)) return dev;
  }

  if (lower.endsWith(`.${ROOT_DOMAIN}`)) return ROOT_DOMAIN;

  return lower;
}

function isAppRoute(pathname: string): boolean {
  const base = pathname.split("/")[1] ?? "";
  return APP_ROUTES.has(`/${base}`) || base.startsWith("_next") || base.startsWith("api");
}

// ── Middleware ────────────────────────────────────────────────────

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";

  // 1. Skip static files
  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  // 2. Resolve auth
  const rawSessionToken = request.cookies.get(sessionCookieName)?.value;
  const token = rawSessionToken ? await verifySessionToken(rawSessionToken) : null;

  // 3. Detect subdomain
  const subdomain = getSubdomain(hostname);

  // 4. Protected routes — redirect to login if not authenticated
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/builder");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute || isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute && token.role !== "super_admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 5. Subdomain-based tenant routing
  //    If we're on a subdomain (e.g., test.localhost.com), rewrite to /site/{subdomain}{pathname}
  //    so the App Router can render the tenant's public page.
  if (subdomain) {
    // App routes accessed via subdomain should redirect to the base domain
    if (isAppRoute(pathname)) {
      const baseDomain = getBaseDomain(hostname);
      const protocol = request.nextUrl.protocol;
      const port = request.nextUrl.port ? `:${request.nextUrl.port}` : "";
      const url = `${protocol}//${baseDomain}${port}${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(url);
    }

    // Rewrite to /site/{subdomain}{pathname} for tenant pages
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/site/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
