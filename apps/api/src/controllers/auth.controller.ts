import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import { connectDatabase } from "../config/database.js";
import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { signSessionToken, getSessionCookieName, getSessionCookieMaxAge, getSessionCookieOptions, verifySessionToken } from "../utils/jwt.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";
import { forgotPassword, loginUser, registerUser, resetPassword } from "../services/auth.service.js";

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
    return sendFailure(response, result.message ?? "Login failed", 401);
  }

  response.cookie(getSessionCookieName(), result.data.token, getSessionCookieOptions(getSessionCookieMaxAge(request.body?.rememberMe === true)));
  return sendSuccess(response, { user: result.data.user, session: result.data.session }, "Signed in");
}

export async function forgotPasswordController(request: Request, response: Response) {
  const result = await forgotPassword(request.body);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message ?? "Reset request failed");
}

export async function resetPasswordController(request: Request, response: Response) {
  const result = await resetPassword(request.body);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message ?? "Reset password failed");
}

export async function meController(request: Request, response: Response) {
  const token = extractCookieToken(request);

  if (!token) {
    return sendSuccess(response, { session: null }, "Unauthenticated");
  }

  try {
    const session = verifySessionToken(token);
    return sendSuccess(response, { session }, "Session loaded");
  } catch {
    return sendSuccess(response, { session: null }, "Session expired");
  }
}

export async function logoutController(_request: Request, response: Response) {
  response.clearCookie(getSessionCookieName(), { path: "/" });
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
  const webUrl = process.env.WEB_URL ?? process.env.APP_URL ?? "http://localhost:3000";

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
      grant_type: "authorization_code"
    })
  });

  if (!tokenResponse.ok) {
    return sendFailure(response, "Failed to exchange Google code", 400);
  }

  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) {
    return sendFailure(response, "Google access token missing", 400);
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
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
      status: "active"
    });

    user = await UserModel.create({
      name: profile.name ?? "Google User",
      email: profile.email,
      passwordHash: randomBytes(24).toString("hex"),
      role: "admin",
      tenantId: tenant._id,
      provider: "google",
      status: "active"
    });

    await TeamMemberModel.create({ tenantId: tenant._id, userId: user._id, role: "owner", status: "active" });
  }

  const session = {
    userId: String(user._id),
    tenantId: String(user.tenantId ?? ""),
    role: user.role,
    email: user.email,
    name: user.name,
    loginType: "user" as const
  };

  const token = signSessionToken(session, "30d");
  response.cookie(getSessionCookieName(), token, getSessionCookieOptions(60 * 60 * 24 * 30));

  const callbackUrl = state ? JSON.parse(Buffer.from(state, "base64url").toString("utf8")).callbackUrl : "/dashboard";
  return response.redirect(`${webUrl}${callbackUrl}`);
}