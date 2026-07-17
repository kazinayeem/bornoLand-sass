import crypto from "crypto";
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

export type AccessTokenPayload = SessionPayload & { type: "access" };
export type SessionTokenPayload = SessionPayload & { type: "session" };

// ── Access Token (short-lived, 15 minutes) ─────────────────────────
export function signAccessToken(payload: SessionPayload) {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
  return jwt.sign({ ...payload, type: "access" }, getSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, getSecret()) as AccessTokenPayload;
  if (payload.type !== "access") {
    throw new Error("Token is not an access token");
  }
  return payload as SessionPayload;
}

// ── Session Token (long-lived JWT, for middleware.ts compat) ───────
export function signSessionToken(payload: SessionPayload, expiresIn: string) {
  return jwt.sign({ ...payload, type: "session" }, getSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifySessionToken(token: string) {
  const payload = jwt.verify(token, getSecret()) as SessionTokenPayload;
  if (payload.type !== "session") {
    throw new Error("Token is not a session token");
  }
  return payload as SessionPayload;
}

// ── Random opaque refresh token ────────────────────────────────────
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRefreshTokenFamily(): string {
  return crypto.randomBytes(16).toString("hex");
}

// ── Cookie helpers ─────────────────────────────────────────────────
export function getSessionCookieName() {
  return sessionCookieName;
}

export function getSessionCookieMaxAge(rememberMe = false) {
  // 7 days default, 14 days if rememberMe (refresh token max rotation window)
  return rememberMe ? 60 * 60 * 24 * 14 : 60 * 60 * 24 * 7;
}

export function getRefreshTokenCookieMaxAge() {
  // 7 days — matches refresh token lifetime
  return 60 * 60 * 24 * 7;
}

export function getSessionCookieOptions(maxAgeSeconds: number) {
  const options: Record<string, unknown> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };

  if (process.env.NODE_ENV === "production") {
    const rootDomain = process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
    const hostname = rootDomain.includes(":") ? rootDomain.split(":")[0] : rootDomain;
    if (hostname) {
      options.domain = process.env.WILDCARD_DOMAIN ?? `.${hostname}`;
    }
  } else if (process.env.WILDCARD_DOMAIN) {
    options.domain = process.env.WILDCARD_DOMAIN;
  }

  return options;
}
