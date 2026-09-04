import { cache } from "react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose/jwt/verify";
import { getApiUrl } from "@/lib/urls";

export type AppSession = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
  defaultStoreSlug?: string | null;
  mustChangePassword?: boolean;
  memberRole?: string;
};

function getSessionCookieName() {
  return process.env.SESSION_COOKIE_NAME ?? "bornoland.session";
}

function getSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "bornoland-dev-secret";
  return new TextEncoder().encode(secret);
}

const REFRESH_TOKEN_RE = /^[a-f0-9]{64}$/;

export const getServerSession = cache(async (): Promise<AppSession | null> => {
  const cookieStore = await cookies();

  // Try legacy JWT session cookie first
  const legacyToken = cookieStore.get("bornoland.session.legacy")?.value;
  if (legacyToken) {
    try {
      const result = await jwtVerify(legacyToken, getSecret());
      const payload = result.payload as unknown as AppSession;
      if (payload?.userId) return payload;
    } catch {
      // expired or invalid — fall through
    }
  }

  // Then try the current session cookie (may be a legacy JWT stored directly)
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (token) {
    try {
      const result = await jwtVerify(token, getSecret());
      const payload = result.payload as unknown as AppSession;
      if (payload?.userId) return payload;
    } catch {
      // Opaque refresh token or non-JWT — resolve authoritatively via API
    }
  }

  // If there are cookies present, query /auth/me from the API server-side
  // to resolve the session and defaultStoreSlug authoritatively.
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      data?: {
        session?: AppSession;
        user?: {
          id?: string;
          tenantId?: string;
          role?: string;
          email?: string;
          name?: string;
          loginType?: "user" | "admin";
          defaultStoreSlug?: string | null;
        };
        defaultStoreSlug?: string | null;
      };
    };

    if (json?.data?.session) {
      const session = json.data.session;
      if (!session.defaultStoreSlug) {
        session.defaultStoreSlug = json.data.defaultStoreSlug || json.data.user?.defaultStoreSlug || null;
      }
      return session;
    }

    if (json?.data?.user) {
      const u = json.data.user;
      return {
        userId: u.id || "",
        tenantId: u.tenantId || "",
        role: u.role || "viewer",
        email: u.email || "",
        name: u.name || "",
        loginType: u.loginType || "user",
        defaultStoreSlug: u.defaultStoreSlug || json.data.defaultStoreSlug || null,
      };
    }

    return null;
  } catch {
    return null;
  }
});

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
  if (refreshToken) {
    return true;
  }

  return false;
}
