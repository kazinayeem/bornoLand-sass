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
import { StoreMemberModel } from "../team/store-member.model.js";
import { StoreModel } from "../stores/store.model.js";
import { EmployeeModel } from "../hrm/employee.model.js";
import { getRoleDefaultLandingPath } from "../../common/types/permissions.js";
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
  getSessionCookieMaxAge,
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

async function resolveUserDefaultStoreSlug(userId: unknown, tenantId?: unknown): Promise<string | null> {
  try {
    const [teamTenantIds, storeMemberStoreIds] = await Promise.all([
      TeamMemberModel.find({ userId }).distinct("tenantId"),
      StoreMemberModel.find({ userId, status: "active" }).distinct("storeId"),
    ]);

    const store = (await StoreModel.findOne({
      $or: [
        { userId },
        ...(tenantId ? [{ tenantId }] : []),
        ...(teamTenantIds.length ? [{ tenantId: { $in: teamTenantIds } }] : []),
        ...(storeMemberStoreIds.length ? [{ _id: { $in: storeMemberStoreIds } }] : []),
      ],
      status: { $ne: "archived" },
    })
      .select("slug")
      .lean()) as { slug?: string } | null;

    return store?.slug ?? null;
  } catch {
    return null;
  }
}

function buildSessionPayload(
  user: {
    _id: unknown;
    tenantId: unknown;
    role: string;
    email: string;
    name: string;
    sessionVersion?: number;
    status?: string;
  },
  loginType: SessionPayload["loginType"],
  defaultStoreSlug?: string | null
): SessionPayload {
  return {
    userId: String(user._id),
    tenantId: String(user.tenantId ?? ""),
    role: user.role,
    email: user.email,
    name: user.name,
    loginType,
    sessionVersion: user.sessionVersion ?? 0,
    defaultStoreSlug: user.role === "super_admin" ? null : (defaultStoreSlug ?? null),
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

  const rawIdentifier = String(parsed.data.email || "").trim();

  let user = (await UserModel.findOne({ email: rawIdentifier.toLowerCase() }).lean()) as {
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

  // If not found by email, check if rawIdentifier is an Employee Code (e.g. EMP-0001, EMP-0042)
  if (!user) {
    const emp = (await EmployeeModel.findOne({
      employeeCode: new RegExp(`^${rawIdentifier}$`, "i"),
    }).lean()) as { _id: unknown; userId?: unknown; email: string } | null;

    if (emp) {
      if (emp.userId) {
        user = (await UserModel.findById(emp.userId).lean()) as any;
      }
      if (!user && emp.email) {
        user = (await UserModel.findOne({ email: emp.email.toLowerCase() }).lean()) as any;
        if (user) {
          await EmployeeModel.updateOne({ _id: emp._id }, { $set: { userId: user._id } }).exec();
        }
      }
    }
  }

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

  let userStores: Array<{ _id: unknown; slug?: string; name?: string }> = [];
  let storesPayload: Array<{ id: string; slug: string; name: string }> = [];
  let defaultStoreSlug: string | null = null;
  let defaultMemberRole = user.role === "super_admin" ? "super_admin" : "member";
  let defaultLandingPath = "/dashboard";

  if (user.role === "super_admin") {
    defaultLandingPath = "/dashboard";
    defaultStoreSlug = null;
  } else {
    try {
      const [teamTenantIds, storeMemberStoreIds] = await Promise.all([
        TeamMemberModel.find({ userId: user._id }).distinct("tenantId"),
        StoreMemberModel.find({ userId: user._id, status: "active" }).distinct("storeId"),
      ]);

      const foundStores = (await StoreModel.find({
        $or: [
          { userId: user._id },
          ...(user.tenantId ? [{ tenantId: user.tenantId }] : []),
          ...(teamTenantIds.length ? [{ tenantId: { $in: teamTenantIds } }] : []),
          ...(storeMemberStoreIds.length ? [{ _id: { $in: storeMemberStoreIds } }] : []),
        ],
        status: { $ne: "archived" },
      })
        .select("_id slug name")
        .lean()) as Array<{ _id: unknown; slug?: string; name?: string }>;
      userStores = foundStores || [];
    } catch {
      // Non-critical
    }

    storesPayload = userStores.map((s) => ({
      id: String(s._id),
      slug: s.slug || "",
      name: s.name || "",
    }));
    defaultStoreSlug = storesPayload[0]?.slug ?? null;

    if (defaultStoreSlug && storesPayload[0]?.id) {
      const mem = (await StoreMemberModel.findOne({
        storeId: storesPayload[0].id,
        userId: user._id,
        status: "active",
      })
        .select("role")
        .lean()) as { role: string } | null;

      if (mem?.role) {
        defaultMemberRole = mem.role;
        defaultLandingPath = getRoleDefaultLandingPath(mem.role, defaultStoreSlug);
      } else {
        const isStoreOwner = Boolean(
          await StoreModel.findOne({ _id: storesPayload[0].id, userId: user._id }).select("_id").lean()
        );
        if (isStoreOwner) {
          defaultMemberRole = "owner";
          defaultLandingPath = `/store/${defaultStoreSlug}/dashboard`;
        } else {
          defaultLandingPath = `/store/${defaultStoreSlug}/dashboard`;
        }
      }
    } else {
      defaultLandingPath = "/dashboard/stores/create";
    }
  }

  const session = buildSessionPayload(
    user,
    isAdminLogin ? "admin" : "user",
    user.role === "super_admin" ? null : defaultStoreSlug
  );

  // Generate Access Token (15min) — returned in response body
  const accessToken = signAccessToken(session);

  // Generate a rotating, HttpOnly refresh token. The selected lifetime is kept
  // on the token record so a renewal cannot silently downgrade Remember Me.
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const family = generateRefreshTokenFamily();
  const sessionMaxAge = getSessionCookieMaxAge(parsed.data.rememberMe);
  const rtExpiresAt = new Date(Date.now() + sessionMaxAge * 1000);

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    family,
    rememberMe: parsed.data.rememberMe,
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
      sessionToken: signSessionToken(session, parsed.data.rememberMe ? "30d" : "7d"),
      refreshToken,
      refreshTokenExpiresAt: rtExpiresAt.toISOString(),
      sessionMaxAge,
      session,
      stores: storesPayload,
      defaultStoreSlug,
      defaultLandingPath,
      memberRole: defaultMemberRole,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: String(user.tenantId ?? ""),
        stores: storesPayload,
        defaultStoreSlug,
        defaultLandingPath,
        memberRole: defaultMemberRole,
      },
    },
  };
}

// ── Refresh: validate Refresh Token, optionally rotate ───────────
type RefreshTokenRecord = {
  _id: unknown;
  userId: unknown;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: string;
  family: string;
  rememberMe?: boolean;
};

async function loadRefreshTokenRecord(rawRefreshToken: string) {
  await connectDatabase();

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const stored = (await RefreshTokenModel.findOne({ tokenHash })) as RefreshTokenRecord | null;

  if (!stored) {
    return { ok: false as const, message: "Refresh token not found" };
  }

  if (stored.revokedAt) {
    await RefreshTokenModel.updateMany(
      { userId: stored.userId, family: stored.family, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
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
    status?: string;
  } | null;

  if (!user) {
    await RefreshTokenModel.deleteMany({ userId: stored.userId });
    return { ok: false as const, message: "User not found" };
  }

  if (user.status && user.status !== "active") {
    await RefreshTokenModel.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    return { ok: false as const, message: `Account ${user.status}` };
  }

  return { ok: true as const, stored, user };
}

export async function sessionFromRefreshToken(
  rawRefreshToken: string,
  options: { rotate?: boolean } = {},
) {
  const loaded = await loadRefreshTokenRecord(rawRefreshToken);
  if (!loaded.ok) return loaded;

  const { stored, user } = loaded;
  let defaultStoreSlug: string | null = null;
  if (user.role !== "super_admin") {
    defaultStoreSlug = await resolveUserDefaultStoreSlug(user._id, user.tenantId);
  }
  const session = buildSessionPayload(
    user,
    user.role === "super_admin" ? "admin" : "user",
    defaultStoreSlug
  );
  const rememberMe = stored.rememberMe === true;
  const sessionMaxAge = getSessionCookieMaxAge(rememberMe);
  const accessToken = signAccessToken(session);
  const sessionToken = signSessionToken(session, rememberMe ? "30d" : "7d");

  if (!options.rotate) {
    return {
      ok: true as const,
      data: {
        accessToken,
        sessionToken,
        session,
        sessionMaxAge,
      },
    };
  }

  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newRefreshToken);
  const newExpiresAt = new Date(Date.now() + sessionMaxAge * 1000);

  await RefreshTokenModel.updateOne({ _id: stored._id }, { $set: { revokedAt: new Date() } });

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: newTokenHash,
    family: stored.family,
    rememberMe,
    expiresAt: newExpiresAt,
    userAgent: stored.userAgent ?? "",
    ipAddress: stored.ipAddress ?? "",
    deviceInfo: stored.deviceInfo ?? "",
  });

  return {
    ok: true as const,
    data: {
      accessToken,
      sessionToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: newExpiresAt.toISOString(),
      sessionMaxAge,
      session,
    },
  };
}

export async function refreshAccessToken(rawRefreshToken: string) {
  return sessionFromRefreshToken(rawRefreshToken, { rotate: true });
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
  ).lean() as { _id: unknown } | null;
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

  let userStores: Array<{ _id: unknown; slug?: string; name?: string }> = [];
  try {
    const teamTenantIds = await TeamMemberModel.find({ userId: user._id }).distinct("tenantId");
    const foundStores = (await StoreModel.find({
      $or: [
        { userId: user._id },
        ...(user.tenantId ? [{ tenantId: user.tenantId }] : []),
        ...(teamTenantIds.length ? [{ tenantId: { $in: teamTenantIds } }] : []),
      ],
      status: { $ne: "archived" },
    })
      .select("_id slug name")
      .lean()) as Array<{ _id: unknown; slug?: string; name?: string }>;
    userStores = foundStores || [];
  } catch {
    // Non-critical
  }

  const storesPayload = userStores.map((s) => ({
    id: String(s._id),
    slug: s.slug || "",
    name: s.name || "",
  }));
  const defaultStoreSlug = storesPayload[0]?.slug ?? null;

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: String(user.tenantId ?? ""),
      stores: storesPayload,
      defaultStoreSlug,
    },
    stores: storesPayload,
    defaultStoreSlug,
    session,
  };
}
