import { NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";
import type { NextRequest } from "next/server";
import { getApiUrl, getAppOrigin } from "@/lib/urls";
import { resolveTenantFromHost } from "@/lib/tenant-resolution";
import { buildLoginUrl, isAuthenticationPath, validateInternalRedirect, validatePlatformRedirect } from "@/lib/auth-redirect";

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
  defaultStoreSlug?: string | null;
};

async function verifySessionToken(token: string): Promise<SessionToken | null> {
  try {
    const result = await jwtVerify(token, secretBytes);
    return result.payload as SessionToken;
  } catch {
    return null;
  }
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

  // Already rewritten / path-based storefront — don't double-wrap.
  if (pathname.startsWith("/site/")) {
    return NextResponse.next();
  }

  const tenant = resolveTenantFromHost(host);
  const debugRouting = process.env.NODE_ENV === "development" || process.env.DEBUG_TENANT_ROUTING === "1";

  // Subdomain / custom domain storefront rewrite.
  // Marketing / platform apex has storeSlug=null → SaaS landing page (no rewrite).
  if (tenant.storeSlug) {
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    if (isAppRoute(pathname)) {
      // On platform apex (IP / localhost + default tenant), keep /dashboard|/login on this host.
      // On loopback multi-tenant domains (*.localhost), keep on current host to prevent Next.js relativizing localhost redirects into an infinite loop.
      const isLoopbackHost = host.endsWith(".localhost") || host.includes(".localhost:") || host.startsWith("localhost");
      if (tenant.source === "default-tenant" || tenant.isPlatformHost || isLoopbackHost) {
        // fall through to auth / app handlers below
      } else {
        const appOrigin = getAppOrigin();
        const url = `${appOrigin}${pathname}${request.nextUrl.search}`;
        if (debugRouting) {
          console.log(
            `[mw] host="${host}" source="${tenant.source}" slug="${tenant.storeSlug}" path="${pathname}" → redirect ${url}`,
          );
        }
        return NextResponse.redirect(url);
      }
    } else {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/site/${tenant.storeSlug}${pathname === "/" ? "" : pathname}`;
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-forwarded-host", host);
      requestHeaders.set("x-store-slug", tenant.storeSlug);
      if (debugRouting) {
        console.log(
          `[mw] host="${host}" source="${tenant.source}" slug="${tenant.storeSlug}" path="${pathname}" → rewrite ${rewriteUrl.pathname}`,
        );
      }
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  if (debugRouting && pathname === "/") {
    console.log(`[mw] host="${host}" source="${tenant.source}" path="${pathname}" → root platform`);
  }

  const legacyBuilderMatch = pathname.match(/^\/dashboard\/builder\/([^/]+)(?:\/([^/]+))?$/);
  if (legacyBuilderMatch) {
    const storeId = legacyBuilderMatch[1];
    const storeSlug = await fetchStoreSlug(storeId, cookieHeader);
    if (storeSlug) {
      return NextResponse.redirect(new URL(`/store/${storeSlug}/builder/home`, request.url));
    }
  }

  const legacyRootBuilderMatch = pathname.match(/^\/builder\/([^/]+)(?:\/([^/]+))?$/);
  if (legacyRootBuilderMatch) {
    const storeId = legacyRootBuilderMatch[1];
    const storeSlug = await fetchStoreSlug(storeId, cookieHeader);
    if (storeSlug) {
      return NextResponse.redirect(new URL(`/store/${storeSlug}/builder/home`, request.url));
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

  const isAuthPage = isAuthenticationPath(pathname);
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/store");
  const isAdminRoute = pathname.startsWith("/admin");

  if (process.env.DEBUG_AUTH === "1" || process.env.NODE_ENV === "development") {
    console.log(
      `[AUTH DEBUG] userId=${session?.userId ?? "none"} role=${session?.role ?? "anonymous"} requestedPath=${pathname} defaultStoreSlug=${session?.defaultStoreSlug ?? "none"}`
    );
  }

  // Redirect authenticated users away from login/register
  if (isAuthPage && (session || hasRefreshToken)) {
    const isSuperAdmin = session?.role === "super_admin";
    const isMerchant = session?.role === "admin" || session?.role === "owner";
    const defaultDestination = isSuperAdmin
      ? "/dashboard"
      : isMerchant
      ? session?.defaultStoreSlug
        ? `/store/${session.defaultStoreSlug}/dashboard`
        : "/dashboard/stores"
      : session?.defaultStoreSlug
      ? `/store/${session.defaultStoreSlug}/dashboard`
      : "/dashboard/stores/create";
    const redirectTo = validatePlatformRedirect(request.nextUrl.searchParams.get("redirect")) ?? defaultDestination;
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  if (isAuthPage) return NextResponse.next();

  // Protected routes
  if (isAdminRoute || isProtectedRoute) {
    // If we have a valid JWT session, proceed with authoritative checks
    if (session) {
      const isSuperAdmin = session.role === "super_admin";

      // Super Admin rules:
      if (isSuperAdmin) {
        if (pathname === "/admin/dashboard" || pathname === "/admin/dashboard/") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-pathname", pathname);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }

      // Non-Super Admin (Merchant / Staff / Employee) rules:
      // Disallow all /admin/* routes for non-super-admins
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      const isMerchant = session.role === "admin" || session.role === "owner";

      // Root /dashboard platform overview is reserved for Super Admin
      // Redirect Merchants & Staff to their store or store list
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
        if (session.defaultStoreSlug) {
          return NextResponse.redirect(
            new URL(`/store/${session.defaultStoreSlug}/dashboard`, request.url)
          );
        }
        if (isMerchant) {
          return NextResponse.redirect(
            new URL("/dashboard/stores", request.url)
          );
        }
        return NextResponse.redirect(
          new URL("/dashboard/stores/create", request.url)
        );
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-pathname", pathname);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // If we have a refresh token but no JWT, we can't verify in middleware.
    // Let the request through — the client-side will verify and redirect if needed.
    // This avoids false redirects to login when the user has a valid refresh token.
    if (hasRefreshToken) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-pathname", pathname);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // No valid session at all — redirect to login
    const destination = `${pathname}${request.nextUrl.search}`;
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(buildLoginUrl(destination, loginPath), request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
