import jwt from "jsonwebtoken";

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
};

const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "bornoland.session";

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

export function signSessionToken(payload: SessionPayload, expiresIn: string) {
  return jwt.sign(payload, getSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, getSecret()) as SessionPayload;
}

export function getSessionCookieName() {
  return sessionCookieName;
}

export function getSessionCookieMaxAge(rememberMe = false) {
  return rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
}

export function getSessionCookieOptions(maxAgeSeconds: number) {
  const options: Record<string, unknown> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };

  // Set a wildcard domain so cookies are shared across subdomains.
  // In production: .bornoland.com  → shared by all *.bornoland.com
  // In development: only set if WILDCARD_DOMAIN is explicitly configured
  // (e.g., .localhost.com for *.localhost.com testing).
  // For lvh.me or bare localhost, omit domain entirely (cookies stay per-origin).
  if (process.env.NODE_ENV === "production") {
    options.domain = process.env.WILDCARD_DOMAIN ?? `.${process.env.ROOT_DOMAIN ?? "bornoland.com"}`;
  } else if (process.env.WILDCARD_DOMAIN) {
    // In development, only set domain if explicitly configured
    // (e.g., WILDCARD_DOMAIN=.localhost.com for *.localhost.com).
    // NOTE: Browsers may reject cookies for .localhost/.lvh.me.
    options.domain = process.env.WILDCARD_DOMAIN;
  }

  return options;
}
