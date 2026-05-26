import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { config } from "@/lib/config";

const PUBLIC_FILE = /\.(.*)$/;
const authSecret = config.JWT_SECRET;
const sessionCookieName = config.sessionCookieName;
const ROOT_DOMAIN = config.rootDomain;
const API_PATH = new URL(config.apiUrl).pathname.replace(/\/$/, "") || "/api";

const APP_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
  "/dashboard",
  "/builder",
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

function getSubdomain(hostname: string): string | null {
  const lower = hostname.toLowerCase();

  if (lower.endsWith(`.${ROOT_DOMAIN}`)) {
    const prefix = lower.slice(0, -(ROOT_DOMAIN.length + 1));
    if (prefix && !prefix.includes(".")) return prefix;
  }

  return null;
}

function getBaseDomain(hostname: string): string {
  const lower = hostname.toLowerCase();

  if (lower.endsWith(`.${ROOT_DOMAIN}`)) return ROOT_DOMAIN;

  return lower;
}

function isAppRoute(pathname: string): boolean {
  const base = pathname.split("/")[1] ?? "";
  return APP_ROUTES.has(`/${base}`) || base.startsWith("_next") || pathname.startsWith(API_PATH);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0] ?? "";

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(hostname);

  if (subdomain) {
    if (pathname.startsWith(API_PATH)) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/products")) {
      return NextResponse.next();
    }

    if (isAppRoute(pathname)) {
      const baseDomain = getBaseDomain(hostname);
      const protocol = request.nextUrl.protocol;
      const port = request.nextUrl.port ? `:${request.nextUrl.port}` : "";
      const url = `${protocol}//${baseDomain}${port}${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(url);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/site/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  const rawSessionToken = request.cookies.get(sessionCookieName)?.value;
  const token = rawSessionToken ? await verifySessionToken(rawSessionToken) : null;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
