import bcrypt from "bcryptjs";
import { connectDatabase } from "../../common/database/connection.js";
import { UserModel } from "../users/user.model.js";
import { StoreModel } from "../stores/store.model.js";
import { RefreshTokenModel } from "../auth/refresh-token.model.js";
import { AuditLogModel } from "../audit/audit-log.model.js";
import { updateProfileSchema, changePasswordSchema } from "./profile.validator.js";

function profileShape(user: Record<string, any>, fallbackStoreName = "") {
  return {
    id: String(user._id),
    name: user.name ?? "",
    username: user.username ?? String(user.email ?? "user").split("@")[0].replace(/[^a-z0-9._-]/gi, "").toLowerCase().slice(0, 30),
    email: user.email ?? "",
    phone: user.phone ?? "",
    company: user.company ?? "",
    storeName: user.storeName ?? fallbackStoreName,
    country: user.country ?? "",
    timezone: user.timezone ?? "Asia/Dhaka",
    language: user.language ?? "en",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
    role: user.role,
    tenantId: user.tenantId ? String(user.tenantId) : "",
    lastLoginAt: user.lastLoginAt ?? null,
    passwordChangedAt: user.passwordChangedAt ?? null,
    createdAt: user.createdAt,
    preferences: {
      theme: user.preferences?.theme ?? "system",
      dateFormat: user.preferences?.dateFormat ?? "DD/MM/YYYY",
      emailNotifications: user.preferences?.emailNotifications ?? true,
      browserNotifications: user.preferences?.browserNotifications ?? true,
      marketingEmails: user.preferences?.marketingEmails ?? false,
    },
  };
}

export async function getProfile(userId: string) {
  await connectDatabase();
  const [userResult, storeResult] = await Promise.all([
    UserModel.findById(userId).select("-passwordHash").lean(),
    StoreModel.findOne({ userId, status: { $ne: "archived" } }).sort({ createdAt: 1 }).select("name").lean(),
  ]);
  const user = userResult as Record<string, any> | null;
  const store = storeResult as { name?: string } | null;
  if (!user) return { ok: false as const, message: "Profile not found" };
  return { ok: true as const, data: { profile: profileShape(user as Record<string, any>, store?.name ?? "") } };
}

export async function updateProfile(userId: string, payload: unknown) {
  const parsed = updateProfileSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Invalid profile" };
  await connectDatabase();
  const duplicate = await UserModel.findOne({
    _id: { $ne: userId },
    $or: [{ email: parsed.data.email }, { username: parsed.data.username }],
  }).select("email username").lean() as { email?: string; username?: string } | null;
  if (duplicate) {
    return { ok: false as const, message: duplicate.email === parsed.data.email ? "Email is already in use" : "Username is already taken" };
  }
  const user = await UserModel.findByIdAndUpdate(userId, { $set: parsed.data }, { new: true, runValidators: true }).select("-passwordHash").lean();
  if (!user) return { ok: false as const, message: "Profile not found" };
  return { ok: true as const, data: { profile: profileShape(user as Record<string, any>) } };
}

export async function setAvatar(userId: string, avatarUrl: string) {
  const user = await UserModel.findByIdAndUpdate(userId, { $set: { avatarUrl } }, { new: true }).select("-passwordHash").lean();
  if (!user) return { ok: false as const, message: "Profile not found" };
  return { ok: true as const, data: { profile: profileShape(user as Record<string, any>) } };
}

export async function changePassword(userId: string, payload: unknown) {
  const parsed = changePasswordSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Invalid password" };
  await connectDatabase();
  const user = await UserModel.findById(userId).select("+passwordHash name email role tenantId sessionVersion");
  if (!user) return { ok: false as const, message: "Profile not found" };
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { ok: false as const, message: "Current password is incorrect" };
  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  user.passwordChangedAt = new Date();
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await user.save();
  await RefreshTokenModel.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
  return {
    ok: true as const,
    data: {
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role, tenantId: String(user.tenantId ?? ""), sessionVersion: user.sessionVersion },
    },
  };
}

function parseClient(userAgent = "") {
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Chrome\//.test(userAgent) ? "Chrome" : /Firefox\//.test(userAgent) ? "Firefox" : /Safari\//.test(userAgent) ? "Safari" : "Unknown browser";
  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? "Mobile device" : "Desktop";
  return { browser, device };
}

export async function listSessions(userId: string, currentTokenHash?: string) {
  await connectDatabase();
  const sessions = await RefreshTokenModel.find({ userId, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).lean();
  return {
    ok: true as const,
    data: {
      sessions: sessions.map((session) => ({
        id: String(session._id),
        ...parseClient(session.userAgent),
        userAgent: session.userAgent || "Unknown",
        ipAddress: session.ipAddress || "Unknown",
        location: !session.ipAddress || session.ipAddress === "::1" || session.ipAddress.includes("127.0.0.1") ? "Local network" : "Location unavailable",
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        current: Boolean(currentTokenHash && session.tokenHash === currentTokenHash),
      })),
    },
  };
}

export async function revokeSession(userId: string, tokenHash: string) {
  await RefreshTokenModel.updateOne({ userId, tokenHash, revokedAt: null }, { $set: { revokedAt: new Date() } });
  return { ok: true as const };
}

export async function revokeAllSessions(userId: string) {
  await Promise.all([
    RefreshTokenModel.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } }),
    UserModel.updateOne({ _id: userId }, { $inc: { sessionVersion: 1 } }),
  ]);
  return { ok: true as const };
}

export async function listProfileActivity(userId: string, page = 1, limit = 20) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const [items, total] = await Promise.all([
    AuditLogModel.find({ actorId: userId }).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    AuditLogModel.countDocuments({ actorId: userId }),
  ]);
  return {
    ok: true as const,
    data: {
      activities: items.map((item) => ({
        id: String(item._id), action: item.action, description: item.description, module: item.module,
        browser: item.browser, device: item.device, ipAddress: item.ipAddress, location: [item.city, item.country].filter(Boolean).join(", "),
        createdAt: item.createdAt, status: item.status,
      })),
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.max(1, Math.ceil(total / safeLimit)) },
    },
  };
}
