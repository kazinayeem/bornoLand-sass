import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import {
  forgotPasswordSchema,
  googleOAuthSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput
} from "../validators/auth.validator.js";
import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";
import { TeamMemberModel } from "../models/team-member.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { VerificationTokenModel } from "../models/verification-token.model.js";
import { AuditLogModel } from "../models/audit-log.model.js";
import { sendEmail } from "../integrations/email.js";
import { signSessionToken, type SessionPayload } from "../utils/jwt.js";

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
    status: "trialing"
  });

  return tenant;
}

function buildSessionPayload(user: {
  _id: unknown;
  tenantId: unknown;
  role: string;
  email: string;
  name: string;
}, loginType: SessionPayload["loginType"]): SessionPayload {
  return {
    userId: String(user._id),
    tenantId: String(user.tenantId ?? ""),
    role: user.role,
    email: user.email,
    name: user.name,
    loginType
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
    passwordHash,
    role: "admin",
    tenantId: tenant._id,
    provider: "credentials",
    status: "active"
  });

  await TeamMemberModel.create({ tenantId: tenant._id, userId: user._id, role: "owner", status: "active" });
  await SubscriptionModel.create({ tenantId: tenant._id, provider: "stripe", plan: "free", status: "trialing" });

  const verificationToken = randomBytes(32).toString("hex");
  await VerificationTokenModel.create({
    identifier: parsed.data.email,
    token: verificationToken,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    purpose: "email-verification"
  });

  await sendEmail({
    to: parsed.data.email,
    subject: "Verify your BornoLand account",
    html: `<p>Welcome to BornoLand. Verify your email token: <strong>${verificationToken}</strong></p>`
  });

  return {
    ok: true as const,
    data: {
      tenantId: String(tenant._id),
      userId: String(user._id)
    }
  };
}

export async function loginUser(payload: unknown) {
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false as const, message: "Invalid credentials payload" };
  }

  await connectDatabase();

  const user = await UserModel.findOne({ email: parsed.data.email }).lean();

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

  const session = buildSessionPayload(
    {
      _id: user._id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      name: user.name
    },
    isAdminLogin ? "admin" : "user"
  );

  const token = signSessionToken(session, parsed.data.rememberMe ? "30d" : "7d");

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        lastLoginAt: new Date(),
        rememberMe: parsed.data.rememberMe,
        loginCount: (user.loginCount ?? 0) + 1
      }
    }
  );

  await AuditLogModel.create({
    actorId: user._id,
    ...(user.tenantId ? { tenantId: user.tenantId } : {}),
    action: isAdminLogin ? "admin_login" : "user_login",
    entityType: "User",
    entityId: user._id
  });

  return {
    ok: true as const,
    data: {
      token,
      session,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: String(user.tenantId ?? "")
      }
    }
  };
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
    purpose: "password-reset"
  });

  await sendEmail({
    to: parsed.data.email,
    subject: "Reset your BornoLand password",
    html: `<p>Reset token: <strong>${token}</strong></p>`
  });

  return { ok: true as const, message: "If the email exists, a reset link has been sent." };
}

export async function resetPassword(payload: unknown) {
  const parsed = resetPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false as const, message: "Invalid reset payload" };
  }

  await connectDatabase();

  const tokenRecord = await VerificationTokenModel.findOne({
    token: parsed.data.token,
    purpose: "password-reset",
    expires: { $gt: new Date() }
  }).lean();

  if (!tokenRecord) {
    return { ok: false as const, message: "Reset token invalid or expired" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await UserModel.updateOne({ email: tokenRecord.identifier }, { $set: { passwordHash } });
  await VerificationTokenModel.deleteMany({ token: parsed.data.token });

  return { ok: true as const, message: "Password updated" };
}

export async function getSessionByEmail(email: string, loginType: "user" | "admin" = "user") {
  await connectDatabase();
  const user = await UserModel.findOne({ email }).lean();

  if (!user) {
    return null;
  }

  const session = buildSessionPayload(
    {
      _id: user._id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      name: user.name
    },
    loginType
  );

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: String(user.tenantId ?? "")
    },
    session
  };
}
