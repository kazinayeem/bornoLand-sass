import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../../common/database/connection.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
} from "./auth.validator.js";
import { TenantModel } from "../workspaces/tenant.model.js";
import { UserModel } from "../users/user.model.js";
import { TeamMemberModel } from "../team/team-member.model.js";
import { SubscriptionModel } from "../subscriptions/subscription.model.js";
import { VerificationTokenModel } from "./verification-token.model.js";
import { RefreshTokenModel } from "./refresh-token.model.js";
import { recordAudit } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";
import { sendEmail } from "../../common/integrations/email.js";
import { getWebUrl } from "../../common/utils/app-url.js";
import {
  signAccessToken,
  signSessionToken,
  generateRefreshToken,
  hashRefreshToken,
  generateRefreshTokenFamily,
  type SessionPayload,
} from "../../common/utils/jwt.js";

function getTenantSlug(tenantName?: string) {
  return (tenantName ?? "demo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureTenantOwner(payload: RegisterInput) {
  const tenantName = payload.tenantName ?? `${payload.name}'s Workspace`;
  const slug = getTenantSlug(tenantName) || randomBytes(4).toString("hex");

  const tenant = await TenantModel.create({
    name: tenantName,
    slug,
    subdomain: slug,
    plan: "free",
    status: "trialing",
  });

  return tenant;
}

function buildSessionPayload(
  user: {
    _id: unknown;
    tenantId: unknown;
    role: string;
    email: string;
    name: string;
    sessionVersion?: number;
  },
  loginType: SessionPayload["loginType"]
): SessionPayload {
  return {
    userId: String(user._id),
    tenantId: String(user.tenantId ?? ""),
    role: user.role,
    email: user.email,
    name: user.name,
    loginType,
    sessionVersion: user.sessionVersion ?? 0,
  };
}

export async function registerUser(payload: unknown) {
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false as const, message: "Invalid registration payload" };
  }

  await connectDatabase();

  const existingUser = await UserModel.findOne({ email: parsed.data.email }).lean();
  if (existingUser) {
    return { ok: false as const, message: "Email already registered" };
  }

  const tenant = await ensureTenantOwner(parsed.data);
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await UserModel.create({
    name: parsed.data.name,
    email: parsed.data.email,
    emailVerifiedAt: null,
    passwordHash,
    role: "admin",
    tenantId: tenant._id,
    provider: "credentials",
    status: "active",
  });

  await TeamMemberModel.create({ tenantId: tenant._id, userId: user._id, role: "owner", status: "active" });
  await SubscriptionModel.create({ tenantId: tenant._id, provider: "stripe", plan: "free", status: "trialing" });

  const verificationToken = randomBytes(32).toString("hex");
  await VerificationTokenModel.create({
    identifier: parsed.data.email,
    token: verificationToken,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    purpose: "email-verification",
  });

  await sendEmail({
    to: parsed.data.email,
    subject: "Verify your BornoLand account",
    html: `<p>Welcome to BornoLand. Click the link below to verify your email:</p><p><a href="${getWebUrl()}/verify-email/${verificationToken}">Verify your email</a></p>`,
  });

  return {
    ok: true as const,
    data: {
      tenantId: String(tenant._id),
      userId: String(user._id),
    },
  };
}

// ── Login: generate Access Token + Refresh Token ─────────────────
export async function loginUser(payload: unknown) {
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false as const, message: "Invalid credentials payload" };
  }

  await connectDatabase();

  const user = (await UserModel.findOne({ email: parsed.data.email }).lean()) as {
    _id: unknown;
    tenantId: unknown;
    role: string;
    email: string;
    name: string;
    passwordHash?: string;
    status: string;
    loginCount?: number;
    sessionVersion?: number;
  } | null;

  if (!user || !user.passwordHash) {
    return { ok: false as const, message: "Invalid credentials" };
  }

  const isAdminLogin = parsed.data.loginType === "admin";
  if (isAdminLogin && user.role !== "super_admin") {
    return { ok: false as const, message: "Admin access required" };
  }

  if (user.status !== "active") {
    return { ok: false as const, message: `Account ${user.status}` };
  }

  const passwordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordValid) {
    return { ok: false as const, message: "Invalid credentials" };
  }

  const session = buildSessionPayload(user, isAdminLogin ? "admin" : "user");

  // Generate Access Token (15min) — returned in response body
  const accessToken = signAccessToken(session);

  // Generate Refresh Token (7d) — stored in httpOnly cookie
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const family = generateRefreshTokenFamily();
  const rtExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    family,
    expiresAt: rtExpiresAt,
    userAgent: (payload as Record<string, unknown>)?.userAgent ?? "",
    ipAddress: (payload as Record<string, unknown>)?.ipAddress ?? "",
  });

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        lastLoginAt: new Date(),
        rememberMe: parsed.data.rememberMe,
        loginCount: (user.loginCount ?? 0) + 1,
        lastLoginIp: String((payload as Record<string, unknown>)?.ipAddress ?? ""),
      },
    }
  );

  await recordAudit({
    actorId: String(user._id),
    tenantId: user.tenantId ? String(user.tenantId) : undefined,
    action: isAdminLogin ? "admin_login" : AUDIT_ACTIONS.LOGIN,
    module: AUDIT_MODULES.AUTH,
    entityType: "User",
    entityId: String(user._id),
    entityName: user.name,
    actorRole: user.role,
  });

  return {
    ok: true as const,
    data: {
      accessToken,
      // Session token for backward compat (read by middleware.ts)
      sessionToken: signSessionToken(session, "7d"),
      refreshToken,
      refreshTokenExpiresAt: rtExpiresAt.toISOString(),
      session,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: String(user.tenantId ?? ""),
      },
    },
  };
}

// ── Refresh: validate Refresh Token, issue new Access Token ──────
export async function refreshAccessToken(rawRefreshToken: string) {
  await connectDatabase();

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const stored = (await RefreshTokenModel.findOne({ tokenHash })) as {
    _id: unknown;
    userId: unknown;
    expiresAt: Date;
    revokedAt: Date | null;
    userAgent?: string;
    ipAddress?: string;
    deviceInfo?: string;
  } | null;

  if (!stored) {
    return { ok: false as const, message: "Refresh token not found" };
  }

  if (stored.revokedAt) {
    return { ok: false as const, message: "Refresh token revoked" };
  }

  if (new Date() > stored.expiresAt) {
    return { ok: false as const, message: "Refresh token expired" };
  }

  const user = (await UserModel.findById(stored.userId).lean()) as {
    _id: unknown;
    tenantId: unknown;
    role: string;
    email: string;
    name: string;
    sessionVersion?: number;
  } | null;

  if (!user) {
    // User was deleted — clean up their tokens
    await RefreshTokenModel.deleteMany({ userId: stored.userId });
    return { ok: false as const, message: "User not found" };
  }

  const session = buildSessionPayload(user, user.role === "super_admin" ? "admin" : "user");
  const newAccessToken = signAccessToken(session);

  // Rotate refresh token (issue new one, revoke old)
  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newRefreshToken);
  const newFamily = generateRefreshTokenFamily();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Revoke the old token
  await RefreshTokenModel.updateOne({ _id: stored._id }, { $set: { revokedAt: new Date() } });

  // Insert new token in the same family
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: newTokenHash,
    family: newFamily,
    expiresAt: newExpiresAt,
    userAgent: stored.userAgent ?? "",
    ipAddress: stored.ipAddress ?? "",
    deviceInfo: stored.deviceInfo ?? "",
  });

  return {
    ok: true as const,
    data: {
      accessToken: newAccessToken,
      sessionToken: signSessionToken(session, "7d"),
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: newExpiresAt.toISOString(),
      session,
    },
  };
}

// ── Logout: revoke all refresh tokens for user ──────────────────
export async function logoutUser(userId?: string) {
  if (userId) {
    // Revoke all refresh tokens for this user
    await RefreshTokenModel.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }
}

export async function forgotPassword(payload: unknown) {
  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false as const, message: "Invalid email" };
  }

  await connectDatabase();
  const user = await UserModel.findOne({ email: parsed.data.email }).lean();

  if (!user) {
    return { ok: true as const, message: "If the email exists, a reset link has been sent." };
  }

  const token = randomBytes(32).toString("hex");
  await VerificationTokenModel.create({
    identifier: parsed.data.email,
    token,
    expires: new Date(Date.now() + 1000 * 60 * 60),
    purpose: "password-reset",
  });

  await sendEmail({
    to: parsed.data.email,
    subject: "Reset your BornoLand password",
    html: `<p>Click the link below to reset your password:</p><p><a href="${getWebUrl()}/reset-password/${token}">Reset your password</a></p>`,
  });

  return { ok: true as const, message: "If the email exists, a reset link has been sent." };
}

export async function resetPassword(payload: unknown) {
  const parsed = resetPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false as const, message: "Invalid reset payload" };
  }

  await connectDatabase();

  const tokenRecord = (await VerificationTokenModel.findOne({
    token: parsed.data.token,
    purpose: "password-reset",
    expires: { $gt: new Date() },
  }).lean()) as { identifier: string } | null;

  if (!tokenRecord) {
    return { ok: false as const, message: "Reset token invalid or expired" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await UserModel.findOneAndUpdate(
    { email: tokenRecord.identifier },
    { $set: { passwordHash, passwordChangedAt: new Date() }, $inc: { sessionVersion: 1 } },
    { new: true },
  ).lean();
  if (user) await RefreshTokenModel.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await VerificationTokenModel.deleteMany({ token: parsed.data.token });

  return { ok: true as const, message: "Password updated" };
}

export async function getSessionByEmail(email: string, loginType: "user" | "admin" = "user") {
  await connectDatabase();
  const user = (await UserModel.findOne({ email }).lean()) as {
    _id: unknown;
    tenantId: unknown;
    role: string;
    email: string;
    name: string;
    sessionVersion?: number;
  } | null;

  if (!user) {
    return null;
  }

  const session = buildSessionPayload(user, loginType);

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: String(user.tenantId ?? ""),
    },
    session,
  };
}
