import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import sharp from "sharp";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { getApiUrl } from "../../common/utils/app-url.js";
import { getSessionCookieMaxAge, getSessionCookieName, generateRefreshToken, generateRefreshTokenFamily, hashRefreshToken, signAccessToken, signSessionToken } from "../../common/utils/jwt.js";
import { clearSessionCookies, setSessionCookies } from "../auth/auth-cookies.js";
import { getUploadRoot } from "../media/providers/local-storage.provider.js";
import { RefreshTokenModel } from "../auth/refresh-token.model.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";
import { sendEmail } from "../../common/integrations/email.js";
import { changePassword, getProfile, listProfileActivity, listSessions, revokeAllSessions, revokeSession, setAvatar, updateProfile } from "./profile.service.js";
import { createBillingNotification } from "../notifications/billing-notification.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});

export const avatarUpload = (request: AuthRequest, response: Response, next: NextFunction) => {
  upload.single("avatar")(request, response, (error) => error ? sendFailure(response, error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5 MB" : "Upload a JPG, PNG, or WebP image", 400) : next());
};

function cookieToken(request: AuthRequest) {
  const match = (request.header("cookie") ?? "").match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  return match?.[1] ?? "";
}

async function removeLocalAvatar(avatarUrl?: string) {
  if (!avatarUrl) return;
  const fileName = avatarUrl.split("/uploads/avatars/")[1];
  if (!fileName || fileName.includes("/") || fileName.includes("..")) return;
  try { await fs.unlink(path.join(getUploadRoot(), "avatars", fileName)); } catch { /* already removed or externally hosted */ }
}

export async function getProfileController(request: AuthRequest, response: Response) {
  const result = await getProfile(request.user!.userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateProfileController(request: AuthRequest, response: Response) {
  const result = await updateProfile(request.user!.userId, request.body);
  if (!result.ok) return sendFailure(response, result.message, result.message.includes("already") || result.message.includes("taken") ? 409 : 400);
  await recordAuditFromRequest(request, { action: AUDIT_ACTIONS.USER_UPDATED, module: AUDIT_MODULES.USERS, entityType: "User", entityId: request.user!.userId, actorId: request.user!.userId, description: "Profile updated" });
  return sendSuccess(response, result.data, "Profile updated");
}

export async function uploadAvatarController(request: AuthRequest, response: Response) {
  if (!request.file) return sendFailure(response, "Choose an image to upload", 400);
  try {
    const metadata = await sharp(request.file.buffer).metadata();
    if (!metadata.width || !metadata.height || metadata.width < 128 || metadata.height < 128) return sendFailure(response, "Image must be at least 128 × 128 pixels", 400);
    if (metadata.width > 6000 || metadata.height > 6000) return sendFailure(response, "Image dimensions are too large", 400);
    const previous = await getProfile(request.user!.userId);
    const previousAvatar = previous.ok ? previous.data.profile.avatarUrl : "";
    const fileName = `${request.user!.userId}-${crypto.randomUUID()}.webp`;
    const directory = path.join(getUploadRoot(), "avatars");
    await fs.mkdir(directory, { recursive: true });
    await sharp(request.file.buffer).rotate().resize(512, 512, { fit: "cover" }).webp({ quality: 88 }).toFile(path.join(directory, fileName));
    const avatarUrl = `${getApiUrl()}/uploads/avatars/${fileName}`;
    const result = await setAvatar(request.user!.userId, avatarUrl);
    if (!result.ok) return sendFailure(response, result.message, 404);
    await removeLocalAvatar(previousAvatar);
    await recordAuditFromRequest(request, { action: AUDIT_ACTIONS.USER_UPDATED, module: AUDIT_MODULES.USERS, entityType: "User", entityId: request.user!.userId, actorId: request.user!.userId, description: "Profile photo updated" });
    return sendSuccess(response, result.data, "Profile photo updated");
  } catch {
    return sendFailure(response, "The uploaded image could not be processed", 400);
  }
}

export async function removeAvatarController(request: AuthRequest, response: Response) {
  const previous = await getProfile(request.user!.userId);
  const result = await setAvatar(request.user!.userId, "");
  if (!result.ok) return sendFailure(response, result.message, 404);
  if (previous.ok) await removeLocalAvatar(previous.data.profile.avatarUrl);
  return sendSuccess(response, result.data, "Profile photo removed");
}

export async function changePasswordController(request: AuthRequest, response: Response) {
  const result = await changePassword(request.user!.userId, request.body);
  if (!result.ok) return sendFailure(response, result.message, result.message.includes("Current") ? 401 : 400);
  const user = result.data.user;
  const session = { userId: user.id, tenantId: user.tenantId, role: user.role, email: user.email, name: user.name, loginType: user.role === "super_admin" ? "admin" as const : "user" as const, sessionVersion: user.sessionVersion };
  const refreshToken = generateRefreshToken();
  const maxAge = getSessionCookieMaxAge();
  await RefreshTokenModel.create({ userId: user.id, tokenHash: hashRefreshToken(refreshToken), family: generateRefreshTokenFamily(), rememberMe: false, expiresAt: new Date(Date.now() + maxAge * 1000), userAgent: request.header("user-agent") ?? "", ipAddress: request.ip ?? "" });
  setSessionCookies(response, {
    refreshToken,
    sessionToken: signSessionToken(session, "7d"),
    sessionMaxAge: maxAge,
  });
  await recordAuditFromRequest(request, { action: AUDIT_ACTIONS.PASSWORD_CHANGED, module: AUDIT_MODULES.AUTH, entityType: "User", entityId: user.id, actorId: user.id, description: "Password changed and previous sessions invalidated" });
  await Promise.allSettled([
    createBillingNotification({ userId: user.id, type: "security_alert", title: "Password changed", message: "Your password was changed and other sessions were signed out.", actionUrl: "/dashboard/security", metadata: { event: "password_changed" } }),
    sendEmail({ to: user.email, subject: "Your BornoLand password was changed", html: `<p>Your password was changed successfully.</p><p>If this wasn't you, contact support immediately and reset your password.</p>` }),
  ]);
  return sendSuccess(response, { accessToken: signAccessToken(session) }, "Password changed. Other sessions have been signed out.");
}

export async function getSessionsController(request: AuthRequest, response: Response) {
  const token = cookieToken(request);
  const result = await listSessions(request.user!.userId, token ? hashRefreshToken(token) : undefined);
  return sendSuccess(response, result.data);
}

export async function logoutCurrentSessionController(request: AuthRequest, response: Response) {
  const token = cookieToken(request);
  if (token) await revokeSession(request.user!.userId, hashRefreshToken(token));
  clearSessionCookies(response);
  await recordAuditFromRequest(request, { action: AUDIT_ACTIONS.SESSION_REVOKED, module: AUDIT_MODULES.AUTH, entityType: "User", entityId: request.user!.userId, actorId: request.user!.userId, description: "Current session logged out" });
  return sendSuccess(response, undefined, "Current session logged out");
}

export async function logoutAllSessionsController(request: AuthRequest, response: Response) {
  await revokeAllSessions(request.user!.userId);
  clearSessionCookies(response);
  await recordAuditFromRequest(request, { action: AUDIT_ACTIONS.SESSION_REVOKED, module: AUDIT_MODULES.AUTH, entityType: "User", entityId: request.user!.userId, actorId: request.user!.userId, description: "All sessions logged out" });
  return sendSuccess(response, undefined, "All devices logged out");
}

export async function getActivityController(request: AuthRequest, response: Response) {
  const result = await listProfileActivity(request.user!.userId, Number(request.query.page ?? 1), Number(request.query.limit ?? 20));
  return sendSuccess(response, result.data);
}
