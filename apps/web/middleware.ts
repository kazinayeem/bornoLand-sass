import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;
const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "bornoland.com";
const authSecret = process.env.JWT_SECRET ?? "bornoland-dev-secret";
const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "bornoland.session";

type SessionToken = {
  role?: string;
};

const secretBytes = new TextEncoder().encode(authSecret);

async function verifySessionToken(token: string): Promise<SessionToken | null> {
  try {
    const result = await jwtVerify(token, secretBytes);
    return result.payload as SessionToken;
  } catch {
    return null;
  }
}

function getSubdomain(hostname: string) {
  const parts = hostname.split(".");

  if (hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`) === false) {
    return null;
  }

  if (parts.length <= 2) {
    return null;
  }

  return parts[0];
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";
  const rawSessionToken = request.cookies.get(sessionCookieName)?.value;
  const token = rawSessionToken ? await verifySessionToken(rawSessionToken) : null;

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(hostname);

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/builder") || pathname.startsWith("/admin");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute && token.role !== "super_admin") {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  if (subdomain && pathname === "/") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/site/${subdomain}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};