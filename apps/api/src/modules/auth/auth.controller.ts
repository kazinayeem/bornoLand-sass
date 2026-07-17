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
  getSessionCookieOptions,
  getSessionCookieMaxAge,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../common/utils/jwt.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { getWebUrl } from "../../common/utils/app-url.js";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
} from "./auth.service.js";
import { RefreshTokenModel } from "./refresh-token.model.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";

function extractCookieToken(request: Request) {
  const rawCookie = request.header("cookie") ?? "";
  const match = rawCookie.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  return match?.[1] ?? null;
}

export async function registerController(request: Request, response: Response) {
  const result = await registerUser(request.body);

  if (!result.ok) {
    return sendFailure(response, result.message ?? "Registration failed", 400);
  }

  return sendSuccess(response, result.data, "Account created", 201);
}

export async function loginController(request: Request, response: Response) {
  const result = await loginUser(request.body);

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
  const rtMaxAge = getRefreshTokenCookieMaxAge();
  response.cookie(getSessionCookieName(), result.data.refreshToken, getSessionCookieOptions(rtMaxAge));

  // Also set a legacy session cookie for middleware.ts backward compat
  response.cookie("bornoland.session.legacy", result.data.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rtMaxAge * 1000,
  });

  return sendSuccess(response, {
    accessToken: result.data.accessToken,
    session: result.data.session,
    user: result.data.user,
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
    response.clearCookie(getSessionCookieName(), { path: "/" });
    response.clearCookie("bornoland.session.legacy", { path: "/" });
    return sendFailure(response, result.message ?? "Refresh failed", 401);
  }

  // Rotate refresh token cookie
  const rtMaxAge = getRefreshTokenCookieMaxAge();
  response.cookie(getSessionCookieName(), result.data.refreshToken, getSessionCookieOptions(rtMaxAge));
  response.cookie("bornoland.session.legacy", result.data.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rtMaxAge * 1000,
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

export async function meController(request: Request, response: Response) {
  // Try to read access token from Authorization header first
  const authHeader = request.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(authHeader.slice(7));
      return sendSuccess(response, { session: payload, accessToken: authHeader.slice(7) }, "Session loaded");
    } catch {
      // Access token expired — fall through to try refresh token
    }
  }

  // Fall back to refresh token from cookie
  const token = extractCookieToken(request);

  if (!token) {
    return sendSuccess(response, { session: null }, "Unauthenticated");
  }

  // Check if it's an opaque refresh token (starts with hex 64 chars)
  if (/^[a-f0-9]{64}$/.test(token)) {
    // This is a refresh token — try to get a new access token
    const result = await refreshAccessToken(token);
    if (!result.ok) {
      return sendSuccess(response, { session: null }, "Session expired");
    }
    return sendSuccess(response, {
      session: result.data.session,
      accessToken: result.data.accessToken,
    }, "Session loaded");
  }

  // Legacy: try to verify as JWT session token (for backward compat)
  try {
    const { verifySessionToken } = await import("../../common/utils/jwt.js");
    const session = verifySessionToken(token);
    return sendSuccess(response, { session }, "Session loaded");
  } catch {
    return sendSuccess(response, { session: null }, "Session expired");
  }
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

  response.clearCookie(getSessionCookieName(), { path: "/" });
  response.clearCookie("bornoland.session.legacy", { path: "/" });
  return sendSuccess(response, undefined, "Signed out");
}

export async function googleStartController(request: Request, response: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const callbackUrl = typeof request.query.redirectUrl === "string" ? request.query.redirectUrl : "/dashboard";

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
  };

  // Generate refresh token
  const { generateRefreshToken, hashRefreshToken, generateRefreshTokenFamily, signAccessToken } = await import("../../common/utils/jwt.js");
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const family = generateRefreshTokenFamily();
  const rtExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    family,
    expiresAt: rtExpiresAt,
  });

  const accessToken = signAccessToken(sessionPayload);
  const rtMaxAge = 7 * 24 * 60 * 60;

  response.cookie(getSessionCookieName(), refreshToken, getSessionCookieOptions(rtMaxAge));
  response.cookie("bornoland.session.legacy", signSessionToken(sessionPayload, "7d"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rtMaxAge * 1000,
  });

  const callbackUrl = state ? JSON.parse(Buffer.from(state, "base64url").toString("utf8")).callbackUrl : "/dashboard";
  // Pass access token as hash fragment so the frontend can read it
  return response.redirect(`${webUrl}${callbackUrl}#access_token=${accessToken}`);
}
