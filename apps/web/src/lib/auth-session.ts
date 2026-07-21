import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type AppSession = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
};

function getSessionCookieName() {
  return process.env.SESSION_COOKIE_NAME ?? "bornoland.session";
}

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(secret);
}

const REFRESH_TOKEN_RE = /^[a-f0-9]{64}$/;

export async function getServerSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();

  // Try legacy JWT session cookie first
  const legacyToken = cookieStore.get("bornoland.session.legacy")?.value;
  if (legacyToken) {
    try {
      const result = await jwtVerify(legacyToken, getSecret());
      return result.payload as unknown as AppSession;
    } catch {
      // expired or invalid — fall through
    }
  }

  // Then try the current session cookie (may be a legacy JWT stored directly)
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) return null;

  try {
    const result = await jwtVerify(token, getSecret());
    return result.payload as unknown as AppSession;
  } catch {
    return null;
  }
}

/**
 * Returns true if any auth-related cookie exists (legacy JWT or opaque refresh token).
 * Server layouts should use this alongside getServerSession() to avoid redirect loops:
 * when a refresh token exists but the JWT hasn't been restored yet, the layout should
 * NOT redirect to /login — the client-side SessionInit will restore the session.
 */
export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const legacyToken = cookieStore.get("bornoland.session.legacy")?.value;
  if (legacyToken) {
    try {
      await jwtVerify(legacyToken, getSecret());
      return true;
    } catch {
      // Expired legacy JWT — fall through to opaque refresh token check.
    }
  }
  const refreshToken = cookieStore.get(getSessionCookieName())?.value;
  if (refreshToken && REFRESH_TOKEN_RE.test(refreshToken)) {
    return true;
  }

  return false;
}
