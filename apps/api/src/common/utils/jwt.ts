import crypto from "crypto";
import jwt from "jsonwebtoken";

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
  sessionVersion?: number;
  defaultStoreSlug?: string | null;
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
  // Sliding session lifetime. The refresh-token rotation endpoint renews this
  // window only after a valid, active session has proved possession of its
  // HttpOnly token.
  return rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
}

export function getRefreshTokenCookieMaxAge(rememberMe = false) {
  return getSessionCookieMaxAge(rememberMe);
}

export function getSessionCookieOptions(maxAgeSeconds: number) {
  const domain = resolveCookieDomain();

  const options: Record<string, unknown> = {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };

  if (domain) {
    options.domain = domain;
  }

  return options;
}

/** Legacy JWT cookie — SameSite lax so OAuth redirects can restore the session. */
export function getLegacySessionCookieOptions(maxAgeSeconds: number) {
  return {
    ...getSessionCookieOptions(maxAgeSeconds),
    sameSite: "lax" as const,
  };
}

/**
 * Only scope cookies to the configured ROOT_DOMAIN tree.
 * Never invent a parent domain from temporary wildcard DNS hosts.
 */
function resolveCookieDomain(): string | undefined {
  const wildcard = process.env.WILDCARD_DOMAIN?.trim();
  if (!wildcard) return undefined;

  const normalized = wildcard.startsWith(".") ? wildcard : `.${wildcard}`;
  const bare = normalized.slice(1);

  const rootDomain = (
    process.env.ROOT_DOMAIN ??
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ??
    ""
  ).trim().toLowerCase();
  const rootHostname = rootDomain.includes(":")
    ? rootDomain.split(":")[0]
    : rootDomain;

  // Local / unset root → host-only cookies
  if (!rootHostname || rootHostname === "localhost" || rootHostname === "127.0.0.1") {
    return undefined;
  }

  // WILDCARD_DOMAIN must match ROOT_DOMAIN (e.g. .example.com for example.com)
  if (bare !== rootHostname) {
    return undefined;
  }

  if (process.env.NODE_ENV !== "production") {
    return undefined;
  }

  return normalized;
}

/**
 * Secure cookies require HTTPS. Override with COOKIE_SECURE=true|false.
 * Derive from APP/WEB URL protocol so HTTP deployments keep working.
 */
function shouldUseSecureCookies(): boolean {
  const explicit = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "true" || explicit === "1") return true;
  if (explicit === "false" || explicit === "0") return false;

  const urls = [
    process.env.APP_URL,
    process.env.WEB_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_PROTOCOL,
  ].filter(Boolean) as string[];

  if (urls.some((u) => u === "https" || u.startsWith("https://"))) return true;
  if (urls.some((u) => u === "http" || u.startsWith("http://"))) return false;

  return process.env.NODE_ENV === "production";
}
