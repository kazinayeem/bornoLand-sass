import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { extractSubdomainFromHost, getApiUrl, getAppOrigin, isRootHost } from "@/lib/urls";

const PUBLIC_FILE = /\.(.*)$/;
const authSecret = process.env.JWT_SECRET ?? "bornoland-dev-secret";
const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "bornoland.session";

const APP_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
  "/api",
  "/dashboard",
  "/store",
  "/admin",
]);

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

function isMongoObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

async function fetchStoreSlug(storeId: string, cookieHeader: string): Promise<string | null> {
  const apiBase = getApiUrl();
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/stores/${storeId}`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: { store?: { slug?: string } } };
    return payload.data?.store?.slug ?? null;
  } catch {
    return null;
  }
}

async function fetchBuilderPageSlug(pageId: string, cookieHeader: string): Promise<string | null> {
  const apiBase = getApiUrl();
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/builder/page/${pageId}`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: { page?: { slug?: string } } };
    return payload.data?.page?.slug ?? null;
  } catch {
    return null;
  }
}

function isAppRoute(pathname: string): boolean {
  const base = pathname.split("/")[1] ?? "";
  return APP_ROUTES.has(`/${base}`) || base.startsWith("_next") || base.startsWith("api");
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const cookieHeader = request.headers.get("cookie") ?? "";

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const subdomain = extractSubdomainFromHost(host);
  if (process.env.NODE_ENV === "development") {
    console.log(`[mw] host="${host}" subdomain=${subdomain} path="${pathname}"`);
  }

  if (subdomain) {
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/products")) {
      return NextResponse.next();
    }

    if (isAppRoute(pathname)) {
      const appOrigin = getAppOrigin();
      const url = `${appOrigin}${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(url);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/site/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (!isRootHost(host) && !subdomain) {
    return NextResponse.next();
  }

  const legacyBuilderMatch = pathname.match(/^\/dashboard\/builder\/([^/]+)(?:\/([^/]+))?$/);
  if (legacyBuilderMatch) {
    const storeId = legacyBuilderMatch[1];
    const pageParam = legacyBuilderMatch[2];
    const storeSlug = await fetchStoreSlug(storeId, cookieHeader);
    if (storeSlug) {
      if (pageParam) {
        const pageSlug = isMongoObjectId(pageParam)
          ? (await fetchBuilderPageSlug(pageParam, cookieHeader)) ?? "home"
          : pageParam;
        return NextResponse.redirect(new URL(`/store/${storeSlug}/builder/${pageSlug}`, request.url));
      }
      return NextResponse.redirect(new URL(`/store/${storeSlug}/builder`, request.url));
    }
  }

  const legacyRootBuilderMatch = pathname.match(/^\/builder\/([^/]+)(?:\/([^/]+))?$/);
  if (legacyRootBuilderMatch) {
    const storeId = legacyRootBuilderMatch[1];
    const pageParam = legacyRootBuilderMatch[2];
    const storeSlug = await fetchStoreSlug(storeId, cookieHeader);
    if (storeSlug) {
      if (pageParam) {
        const pageSlug = isMongoObjectId(pageParam)
          ? (await fetchBuilderPageSlug(pageParam, cookieHeader)) ?? "home"
          : pageParam;
        return NextResponse.redirect(new URL(`/store/${storeSlug}/builder/${pageSlug}`, request.url));
      }
      return NextResponse.redirect(new URL(`/store/${storeSlug}/builder`, request.url));
    }
  }

  // ── Auth check ────────────────────────────────────────────────
  // Try legacy JWT session cookie first (backward compat + middleware edge runtime
  // can't make API calls to verify opaque refresh tokens)
  const rawLegacyToken = request.cookies.get("bornoland.session.legacy")?.value;
  const rawRefreshToken = request.cookies.get(sessionCookieName)?.value;

  // Verify the legacy JWT session token if present
  let session: SessionToken | null = null;
  if (rawLegacyToken) {
    session = await verifySessionToken(rawLegacyToken);
  }

  // If no legacy token but refresh token exists, we still treat as "potentially authenticated"
  // and let the client-side handle the actual auth check via /auth/refresh + /auth/me.
  // The user won't see a flash of login page because the client will immediately refresh.
  const hasRefreshToken = !!rawRefreshToken && /^[a-f0-9]{64}$/.test(rawRefreshToken);

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/store");
  const isAdminRoute = pathname.startsWith("/admin");

  // Redirect authenticated users away from login/register
  if (isAuthPage && (session || hasRefreshToken)) {
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Protected routes
  if (isAdminRoute || isProtectedRoute) {
    // If we have a valid JWT session, proceed
    if (session) {
      if (isAdminRoute && session.role !== "super_admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      return NextResponse.next();
    }

    // If we have a refresh token but no JWT, we can't verify in middleware.
    // Let the request through — the client-side will verify and redirect if needed.
    // This avoids false redirects to login when the user has a valid refresh token.
    if (hasRefreshToken) {
      return NextResponse.next();
    }

    // No valid session at all — redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
