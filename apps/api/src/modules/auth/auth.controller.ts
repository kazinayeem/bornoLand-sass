import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { TenantModel } from "../workspaces/tenant.model.js";
import { UserModel } from "../users/user.model.js";
import { TeamMemberModel } from "../team/team-member.model.js";
import {
  signSessionToken,
  getSessionCookieName,
  getRefreshTokenCookieMaxAge,
  getSessionCookieMaxAge,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../common/utils/jwt.js";
import { clearSessionCookies, setSessionCookies } from "./auth-cookies.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { getWebUrl } from "../../common/utils/app-url.js";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  resolveUserDefaultStoreSlug,
  resolveUserMemberRole,
  sessionFromRefreshToken,
} from "./auth.service.js";
import { RefreshTokenModel } from "./refresh-token.model.js";
import { VerificationTokenModel } from "./verification-token.model.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";

function extractCookieToken(request: Request) {
  const rawCookie = request.header("cookie") ?? "";
  const match = rawCookie.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  return match?.[1] ?? null;
}

function extractSessionTokens(request: Request) {
  const rawCookie = request.header("cookie") ?? "";
  const refreshMatch = rawCookie.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  const legacyMatch = rawCookie.match(/bornoland\.session\.legacy=([^;]+)/);
  return {
    refreshToken: refreshMatch?.[1] ?? null,
    legacyToken: legacyMatch?.[1] ?? null,
  };
}

function writeSessionCookies(
  response: Response,
  data: {
    refreshToken: string;
    sessionToken: string;
    sessionMaxAge: number;
  },
) {
  setSessionCookies(response, data);
}

function safeOAuthCallbackPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.length > 2048) return "/dashboard";
  try {
    const base = new URL("https://bornoland.internal");
    const parsed = new URL(value, base);
    if (parsed.origin !== base.origin) return "/dashboard";
    const path = parsed.pathname.toLowerCase();
    const blocked = ["/login", "/register", "/forgot-password", "/reset-password", "/logout", "/auth", "/admin/login"];
    if (blocked.some((route) => path === route || path.startsWith(`${route}/`))) return "/dashboard";
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/dashboard";
  }
}

async function isSessionPayloadActive(payload: { userId: string; sessionVersion?: number }) {
  await connectDatabase();
  const user = await UserModel.findById(payload.userId).select("status sessionVersion").lean() as
    | { status?: string; sessionVersion?: number }
    | null;
  return Boolean(user && user.status === "active" && (user.sessionVersion ?? 0) === (payload.sessionVersion ?? 0));
}

export async function registerController(request: Request, response: Response) {
  const result = await registerUser(request.body);

  if (!result.ok) {
    return sendFailure(response, result.message ?? "Registration failed", 400);
  }

  return sendSuccess(response, result.data, "Account created", 201);
}

export async function loginController(request: Request, response: Response) {
  const result = await loginUser({
    ...request.body,
    userAgent: request.header("user-agent") ?? "",
    ipAddress: request.ip ?? "",
  });

  if (!result.ok) {
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      module: AUDIT_MODULES.AUTH,
      entityType: "User",
      status: "failure",
      metadata: { email: request.body?.email },
      description: "Failed login attempt",
    });
    return sendFailure(response, result.message ?? "Login failed", 401);
  }

  await recordAuditFromRequest(request, {
    action: AUDIT_ACTIONS.LOGIN,
    module: AUDIT_MODULES.AUTH,
    entityType: "User",
    entityId: result.data.user.id,
    entityName: result.data.user.name,
    actorId: result.data.user.id,
    actorRole: result.data.user.role,
    tenantId: result.data.user.tenantId,
  });

  // Set Refresh Token as httpOnly cookie
  const rtMaxAge = result.data.sessionMaxAge ?? getRefreshTokenCookieMaxAge(Boolean(request.body?.rememberMe));
  writeSessionCookies(response, {
    refreshToken: result.data.refreshToken,
    sessionToken: result.data.sessionToken,
    sessionMaxAge: rtMaxAge,
  });

  return sendSuccess(response, {
    accessToken: result.data.accessToken,
    session: result.data.session,
    user: result.data.user,
    stores: result.data.stores,
    defaultStoreSlug: result.data.defaultStoreSlug,
    defaultLandingPath: result.data.defaultLandingPath,
    memberRole: result.data.memberRole,
    mustChangePassword: Boolean(result.data.mustChangePassword),
  }, "Signed in");
}

export async function refreshController(request: Request, response: Response) {
  // Read refresh token from cookie (same cookie name for simplicity)
  const rawCookie = request.header("cookie") ?? "";
  const cookieName = getSessionCookieName();
  const match = rawCookie.match(new RegExp(`${cookieName}=([^;]+)`));
  const refreshTokenValue = match?.[1];

  if (!refreshTokenValue) {
    return sendFailure(response, "Refresh token not found", 401);
  }

  const result = await refreshAccessToken(refreshTokenValue);

  if (!result.ok) {
    clearSessionCookies(response);
    return sendFailure(response, result.message ?? "Refresh failed", 401);
  }

  // Rotate refresh token cookie
  const rtMaxAge = result.data.sessionMaxAge ?? getRefreshTokenCookieMaxAge();
  writeSessionCookies(response, {
    refreshToken: result.data.refreshToken || refreshTokenValue,
    sessionToken: result.data.sessionToken,
    sessionMaxAge: rtMaxAge,
  });


  return sendSuccess(response, {
    accessToken: result.data.accessToken,
    session: result.data.session,
  }, "Token refreshed");
}

export async function forgotPasswordController(request: Request, response: Response) {
  const result = await forgotPassword(request.body);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message ?? "Reset request failed");
}

export async function resetPasswordController(request: Request, response: Response) {
  const result = await resetPassword(request.body);
  if (result.ok) {
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      module: AUDIT_MODULES.AUTH,
      entityType: "User",
      description: "Password reset completed",
    });
  }
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message ?? "Reset password failed");
}

export async function verifyEmailController(request: Request, response: Response) {
  const { token } = request.body as { token: string };

  const doc = await VerificationTokenModel.findOne({
    token,
    purpose: "email-verification",
    expires: { $gt: new Date() },
  });

  if (!doc) {
    return sendFailure(response, "Invalid or expired verification token", 400);
  }

  const user = await UserModel.findOneAndUpdate(
    { email: doc.identifier },
    { $set: { emailVerifiedAt: new Date() } },
    { new: true }
  );

  if (!user) {
    return sendFailure(response, "User not found", 404);
  }

  await VerificationTokenModel.deleteMany({ identifier: doc.identifier });

  return sendSuccess(response, null, "Email verified successfully");
}

export async function meController(request: Request, response: Response) {
  // Prevent browser & proxy HTTP caching of authenticated session status
  response.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  response.setHeader("Surrogate-Control", "no-store");
  response.removeHeader("ETag");
  delete (request.headers as any)["if-none-match"];
  delete (request.headers as any)["if-modified-since"];

  const buildUserFromDb = async (userId: string, defaultStoreSlug?: string | null) => {
    try {
      await connectDatabase();
      const u = (await UserModel.findById(userId).select("name email role tenantId mustChangePassword").lean()) as any;
      if (!u) return null;
      const slug = defaultStoreSlug ?? (u.role !== "super_admin" ? await resolveUserDefaultStoreSlug(u._id, u.tenantId, u.role) : null);
      const memberRole = await resolveUserMemberRole(u._id, slug ?? null, u.role);
      return {
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        tenantId: String(u.tenantId ?? ""),
        defaultStoreSlug: slug ?? null,
        memberRole,
        mustChangePassword: Boolean(u.mustChangePassword),
      };
    } catch {
      return null;
    }
  };

  // Try to read access token from Authorization header first
  const authHeader = request.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(authHeader.slice(7));
      if (await isSessionPayloadActive(payload)) {
        const user = await buildUserFromDb(payload.userId, payload.defaultStoreSlug);
        if (user && user.role) payload.role = user.role;
        return sendSuccess(
          response,
          {
            session: payload,
            user,
            defaultStoreSlug: user?.defaultStoreSlug || payload.defaultStoreSlug || null,
            accessToken: authHeader.slice(7),
          },
          "Session loaded"
        );
      }
    } catch {
      // Access token expired — fall through to try cookies
    }
  }

  const { refreshToken, legacyToken } = extractSessionTokens(request);

  // Check if opaque refresh token exists
  if (refreshToken && /^[a-f0-9]{64}$/.test(refreshToken)) {
    const result = await sessionFromRefreshToken(refreshToken, { rotate: false });
    if (!result.ok) {
      clearSessionCookies(response);
      return sendSuccess(response, { session: null, user: null }, "Session expired");
    }

    writeSessionCookies(response, {
      refreshToken,
      sessionToken: result.data.sessionToken,
      sessionMaxAge: result.data.sessionMaxAge,
    });

    const user =
      (result.data as any).user ||
      (await buildUserFromDb(result.data.session.userId, result.data.session.defaultStoreSlug));
    if (user && user.role) result.data.session.role = user.role;

    return sendSuccess(response, {
      session: result.data.session,
      user,
      defaultStoreSlug: user?.defaultStoreSlug || result.data.session.defaultStoreSlug || null,
      accessToken: result.data.accessToken,
    }, "Session loaded");
  }

  // Check legacy JWT token or non-opaque token
  const jwtCookie = legacyToken || (refreshToken && !/^[a-f0-9]{64}$/.test(refreshToken) ? refreshToken : null);
  if (jwtCookie) {
    try {
      const { verifySessionToken } = await import("../../common/utils/jwt.js");
      const session = verifySessionToken(jwtCookie);
      if (await isSessionPayloadActive(session)) {
        const user = await buildUserFromDb(session.userId, session.defaultStoreSlug);
        if (user && user.role) session.role = user.role;
        return sendSuccess(response, {
          session,
          user,
          defaultStoreSlug: user?.defaultStoreSlug || session.defaultStoreSlug || null,
        }, "Session loaded");
      }
      clearSessionCookies(response);
      return sendSuccess(response, { session: null, user: null }, "Session expired");
    } catch {
      clearSessionCookies(response);
      return sendSuccess(response, { session: null, user: null }, "Session expired");
    }
  }

  return sendSuccess(response, { session: null, user: null }, "Unauthenticated");
}

export async function logoutController(request: Request, response: Response) {
  const token = extractCookieToken(request);
  let userId: string | undefined;

  if (token) {
    // Try to extract userId from the RT cookie by looking it up
    if (/^[a-f0-9]{64}$/.test(token)) {
      const tokenHash = hashRefreshToken(token);
      const stored = await RefreshTokenModel.findOne({ tokenHash }).lean() as { userId?: unknown } | null;
      if (stored?.userId) {
        userId = String(stored.userId);
      }
    }

    // Fallback: try to decode as JWT to get userId for audit
    if (!userId) {
      try {
        const { verifySessionToken } = await import("../../common/utils/jwt.js");
        const session = verifySessionToken(token);
        userId = session.userId;
      } catch {
        // ignore
      }
    }

    if (userId) {
      await recordAuditFromRequest(request, {
        action: AUDIT_ACTIONS.LOGOUT,
        module: AUDIT_MODULES.AUTH,
        entityType: "User",
        entityId: userId,
        actorId: userId,
      });
    }
  }

  // Revoke all refresh tokens for this user
  if (userId) {
    await logoutUser(userId);
  }

  clearSessionCookies(response);
  return sendSuccess(response, undefined, "Signed out");
}

export async function googleStartController(request: Request, response: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const callbackUrl = safeOAuthCallbackPath(request.query.redirectUrl);

  if (!clientId || !redirectUri) {
    return sendFailure(response, "Google OAuth is not configured", 503);
  }

  const state = Buffer.from(JSON.stringify({ callbackUrl })).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent");

  return response.redirect(url.toString());
}

export async function googleCallbackController(request: Request, response: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const webUrl = getWebUrl();

  const code = typeof request.query.code === "string" ? request.query.code : null;
  const state = typeof request.query.state === "string" ? request.query.state : null;

  if (!clientId || !clientSecret || !redirectUri || !code) {
    return sendFailure(response, "Google OAuth callback is not configured", 503);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    return sendFailure(response, "Failed to exchange Google code", 400);
  }

  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) {
    return sendFailure(response, "Google access token missing", 400);
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!profileResponse.ok) {
    return sendFailure(response, "Failed to fetch Google profile", 400);
  }

  const profile = (await profileResponse.json()) as { email?: string; name?: string; picture?: string };
  if (!profile.email) {
    return sendFailure(response, "Google email missing", 400);
  }

  await connectDatabase();
  let user = await UserModel.findOne({ email: profile.email });

  if (!user) {
    const slug = profile.email.split("@")[0].replace(/[^a-z0-9]+/g, "-");
    const tenant = await TenantModel.create({
      name: `${profile.name ?? "Google User"}'s Workspace`,
      slug,
      subdomain: slug,
      plan: "free",
      status: "active",
    });

    user = await UserModel.create({
      name: profile.name ?? "Google User",
      email: profile.email,
      passwordHash: randomBytes(24).toString("hex"),
      role: "admin",
      tenantId: tenant._id,
      provider: "google",
      status: "active",
    });

    await TeamMemberModel.create({ tenantId: tenant._id, userId: user._id, role: "owner", status: "active" });
  }

  const sessionPayload = {
    userId: String(user._id),
    tenantId: String(user.tenantId ?? ""),
    role: user.role,
    email: user.email,
    name: user.name,
    loginType: "user" as const,
    sessionVersion: user.sessionVersion ?? 0,
  };

  // Generate refresh token
  const { generateRefreshToken, hashRefreshToken, generateRefreshTokenFamily, signAccessToken } = await import("../../common/utils/jwt.js");
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const family = generateRefreshTokenFamily();
  const rtMaxAge = getSessionCookieMaxAge();
  const rtExpiresAt = new Date(Date.now() + rtMaxAge * 1000);

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    family,
    rememberMe: false,
    expiresAt: rtExpiresAt,
  });

  const accessToken = signAccessToken(sessionPayload);

  writeSessionCookies(response, {
    refreshToken,
    sessionToken: signSessionToken(sessionPayload, "7d"),
    sessionMaxAge: rtMaxAge,
  });

  const defaultDestination = user.role === "super_admin" ? "/dashboard" : "/workshops";
  let callbackUrl = defaultDestination;
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
      if (parsed.callbackUrl) {
        const safe = safeOAuthCallbackPath(parsed.callbackUrl);
        if (user.role !== "super_admin" && (safe === "/dashboard" || safe === "/dashboard/")) {
          callbackUrl = "/workshops";
        } else {
          callbackUrl = safe;
        }
      }
    } catch {
      callbackUrl = defaultDestination;
    }
  }
  // Pass access token as a fragment; fragments never reach the server or logs.
  const destination = new URL(callbackUrl, `${webUrl}/`);
  destination.hash = `access_token=${accessToken}`;
  return response.redirect(destination.toString());
}
