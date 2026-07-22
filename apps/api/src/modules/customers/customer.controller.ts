import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { registerCustomer, loginCustomer, getCustomerById, requestCustomerPasswordReset } from "./customer.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { z } from "zod";
import { CustomerModel } from "../../models/customer.model.js";
import { getApiUrl } from "../../common/utils/app-url.js";
import { getUploadRoot } from "../media/providers/local-storage.provider.js";
import {
  deleteCustomerNotification,
  getCustomerUnreadNotificationCount,
  listCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from "./customer-notification.service.js";

function getCustomerJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function issueCustomerToken(customer: {
  _id: unknown;
  storeId: unknown;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  birthday?: Date | string | null;
  gender?: string;
  totalOrders?: number;
  createdAt?: Date | string;
  tokenVersion?: number;
}) {
  return jwt.sign(
    {
      customerId: customer._id,
      storeId: customer.storeId,
      email: customer.email,
      name: customer.name,
      phone: customer.phone ?? "",
      avatar: customer.avatar ?? "",
      birthday: customer.birthday ?? null,
      gender: customer.gender ?? "",
      totalOrders: customer.totalOrders ?? 0,
      createdAt: customer.createdAt ?? null,
      tokenVersion: customer.tokenVersion ?? 0,
    },
    getCustomerJwtSecret(),
    { expiresIn: "7d" }
  );
}

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});

async function decodeCustomerFromAuth(request: SubdomainRequest) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return { ok: false as const, message: "Not authenticated" };
  const decoded = jwt.verify(authHeader.split(" ")[1], getCustomerJwtSecret()) as {
    customerId: string;
    storeId?: string;
    tokenVersion?: number;
    iat?: number;
  };
  if (!decoded.customerId) return { ok: false as const, message: "Not authenticated" };
  const customer = (await CustomerModel.findById(decoded.customerId)
    .select({ tokenVersion: 1, storeId: 1 })
    .lean()) as { tokenVersion?: number; storeId?: unknown } | null;
  if (!customer) return { ok: false as const, message: "Not authenticated" };

  // Legacy customers may omit tokenVersion in Mongo; issuance uses `?? 0`.
  const storedVersion = typeof customer.tokenVersion === "number" ? customer.tokenVersion : 0;
  const tokenVersion = typeof decoded.tokenVersion === "number" ? decoded.tokenVersion : 0;
  if (tokenVersion !== storedVersion) {
    return { ok: false as const, message: "Session expired. Please sign in again." };
  }
  return { ok: true as const, decoded };
}

export async function registerController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id;
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { name, email, password } = request.body;
  if (!name || !email || !password) return sendFailure(response, "Name, email, and password required");

  const result = await registerCustomer(storeId.toString(), { name, email, password });
  return result.ok
    ? sendSuccess(response, result.data, "Registered", 201)
    : sendFailure(response, result.message);
}

export async function loginController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id;
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { email, password } = request.body;
  if (!email || !password) return sendFailure(response, "Email and password required");

  const result = await loginCustomer(storeId.toString(), { email, password });
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, 401);
}

export async function meController(request: SubdomainRequest, response: Response) {
  try {
    const decodedResult = await decodeCustomerFromAuth(request);
    if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);

    const result = await getCustomerById(decodedResult.decoded.customerId);
    return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
  } catch {
    return sendFailure(response, "Invalid or expired token", 401);
  }
}

export async function forgotPasswordController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id;
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const email = typeof request.body?.email === "string" ? request.body.email : "";
  if (!email.trim()) return sendFailure(response, "Email is required", 400);

  const result = await requestCustomerPasswordReset(storeId.toString(), email);
  return sendSuccess(response, result.data, result.data.message);
}

export async function getProfileController(request: SubdomainRequest, response: Response) {
  // Alias for /customer/me (kept for forward compatibility with account center pages).
  return meController(request, response);
}

export async function updateProfileController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);

  const storeId = request.store?._id ?? decodedResult.decoded.storeId;

  const payloadSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120),
    phone: z.string().trim().min(1, "Phone is required").max(30),
    birthday: z.union([z.string().trim().min(1), z.literal(""), z.null()]).optional(),
    gender: z.enum(["male", "female", "non_binary", "prefer_not_to_say", ""]).optional(),
  });

  const parsed = payloadSchema.safeParse(request.body);
  if (!parsed.success) return sendFailure(response, parsed.error.issues[0]?.message ?? "Invalid profile payload", 400);

  const customer = (await CustomerModel.findOne({
    _id: decodedResult.decoded.customerId,
    storeId,
  }).lean()) as any;

  if (!customer) return sendFailure(response, "Not authenticated", 401);

  await CustomerModel.updateOne(
    { _id: decodedResult.decoded.customerId, storeId },
    {
      $set: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        birthday: parsed.data.birthday ? new Date(parsed.data.birthday) : null,
        gender: parsed.data.gender ?? "",
      },
    },
  );

  const updated = (await CustomerModel.findOne({ _id: decodedResult.decoded.customerId, storeId }).lean()) as any;
  if (!updated) return sendFailure(response, "Not authenticated", 401);

  const token = issueCustomerToken(updated as any);
  return sendSuccess(response, { customer: {
    _id: updated._id,
    storeId: updated.storeId,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    avatar: updated.avatar,
  }, token }, "Profile updated");
}

export async function changePasswordController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);

  const storeId = request.store?._id ?? decodedResult.decoded.storeId;

  const payloadSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  });

  const parsed = payloadSchema.safeParse(request.body);
  if (!parsed.success) return sendFailure(response, parsed.error.issues[0]?.message ?? "Invalid password payload", 400);

  if (parsed.data.newPassword !== parsed.data.confirmPassword) return sendFailure(response, "New password and confirm password do not match", 400);

  const customer = await CustomerModel.findOne({ _id: decodedResult.decoded.customerId, storeId });
  if (!customer) return sendFailure(response, "Not authenticated", 401);

  const valid = await bcrypt.compare(parsed.data.currentPassword, customer.passwordHash);
  if (!valid) return sendFailure(response, "Current password is incorrect", 401);

  customer.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  customer.tokenVersion = (customer.tokenVersion ?? 0) + 1;
  await customer.save();

  const updatedToken = issueCustomerToken(customer.toObject() as any);
  return sendSuccess(response, { token: updatedToken }, "Password updated — other devices logged out");
}

export async function uploadAvatarController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);

  const storeId = request.store?._id ?? decodedResult.decoded.storeId;

  const uploadError = await new Promise<string | null>((resolve) => {
    avatarUpload.single("avatar")(request as any, response as any, (err) => {
      if (!err) return resolve(null);
      const message =
        err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "Image must be smaller than 5 MB"
          : "Upload a JPG, PNG, or WebP image";
      resolve(message);
    });
  });

  if (uploadError) return sendFailure(response, uploadError, 400);

  const file = (request as any).file as Express.Multer.File | undefined;
  if (!file) return sendFailure(response, "Choose an image to upload", 400);

  try {
    const metadata = await sharp(file.buffer).metadata();
    if (!metadata.width || !metadata.height || metadata.width < 128 || metadata.height < 128) {
      return sendFailure(response, "Image must be at least 128 × 128 pixels", 400);
    }

    const customer = (await CustomerModel.findOne({ _id: decodedResult.decoded.customerId, storeId }).lean()) as any;
    if (!customer) return sendFailure(response, "Not authenticated", 401);

    const directory = path.join(getUploadRoot(), "avatars");
    await fs.mkdir(directory, { recursive: true });

    const prevAvatarUrl = customer.avatar;
    const fileName = `${decodedResult.decoded.customerId}-${crypto.randomUUID()}.webp`;
    const filePath = path.join(directory, fileName);

    await sharp(file.buffer).rotate().resize(512, 512, { fit: "cover" }).webp({ quality: 88 }).toFile(filePath);
    const avatarUrl = `${getApiUrl()}/uploads/avatars/${fileName}`;

    await CustomerModel.updateOne({ _id: decodedResult.decoded.customerId, storeId }, { $set: { avatar: avatarUrl } });

    // Cleanup previous local avatar file if it was stored in our /uploads/avatars folder.
    if (prevAvatarUrl?.includes("/uploads/avatars/")) {
      const oldName = prevAvatarUrl.split("/uploads/avatars/")[1];
      if (oldName && !oldName.includes("/") && !oldName.includes("..")) {
        try { await fs.unlink(path.join(directory, oldName)); } catch {}
      }
    }

    const updated = (await CustomerModel.findOne({ _id: decodedResult.decoded.customerId, storeId }).lean()) as any;
    if (!updated) return sendFailure(response, "Avatar upload failed", 400);

    const token = issueCustomerToken(updated as any);
    return sendSuccess(response, { customer: {
      _id: updated._id,
      storeId: updated.storeId,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      avatar: updated.avatar,
    }, token }, "Profile photo updated");
  } catch {
    return sendFailure(response, "The uploaded image could not be processed", 400);
  }
}

export async function removeAvatarController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);

  const storeId = request.store?._id ?? decodedResult.decoded.storeId;

  const customer = (await CustomerModel.findOne({ _id: decodedResult.decoded.customerId, storeId }).lean()) as any;
  if (!customer) return sendFailure(response, "Not authenticated", 401);

  const prevAvatarUrl = customer.avatar;
  await CustomerModel.updateOne({ _id: decodedResult.decoded.customerId, storeId }, { $set: { avatar: "" } });

  if (prevAvatarUrl?.includes("/uploads/avatars/")) {
    const directory = path.join(getUploadRoot(), "avatars");
    const oldName = prevAvatarUrl.split("/uploads/avatars/")[1];
    if (oldName && !oldName.includes("/") && !oldName.includes("..")) {
      try { await fs.unlink(path.join(directory, oldName)); } catch {}
    }
  }

  const updated = (await CustomerModel.findOne({ _id: decodedResult.decoded.customerId, storeId }).lean()) as any;
  if (!updated) return sendFailure(response, "Avatar removal failed", 400);

  const token = issueCustomerToken(updated as any);
  return sendSuccess(response, { customer: {
    _id: updated._id,
    storeId: updated.storeId,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    avatar: updated.avatar,
  }, token }, "Profile photo removed");
}

export async function logoutAllDevicesController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);

  const storeId = request.store?._id ?? decodedResult.decoded.storeId;

  await CustomerModel.updateOne(
    { _id: decodedResult.decoded.customerId, storeId },
    { $inc: { tokenVersion: 1 } },
  );

  return sendSuccess(response, undefined, "All devices logged out");
}

export async function listSessionsController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);

  const storeId = request.store?._id ?? decodedResult.decoded.storeId;
  const customer = (await CustomerModel.findOne({ _id: decodedResult.decoded.customerId, storeId }).lean()) as any;
  if (!customer) return sendFailure(response, "Not authenticated", 401);

  // Minimal implementation: we treat the JWT as the active session.
  const iat = typeof decodedResult.decoded.iat === "number" ? decodedResult.decoded.iat * 1000 : null;
  const startedAt = iat ? new Date(iat).toISOString() : null;
  const device = (request.headers["user-agent"] ? String(request.headers["user-agent"]) : "Browser").slice(0, 80);

  return sendSuccess(response, {
    sessions: [
      {
        _id: "current",
        device,
        startedAt,
        isActive: true,
        ipAddress: request.ip ?? "",
        userAgent: String(request.headers["user-agent"] ?? ""),
      },
    ],
    loginHistory: [
      { _id: "last", createdAt: customer.lastLoginAt ? customer.lastLoginAt.toISOString() : null },
    ],
  });
}

export async function listNotificationsController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);
  const storeId = String(request.store?._id ?? decodedResult.decoded.storeId ?? "");
  const page = Number(request.query.page ?? 1);
  const limit = Number(request.query.limit ?? 20);
  const unreadOnly = request.query.unreadOnly === "true";
  const type = typeof request.query.type === "string" ? request.query.type : "";
  const search = typeof request.query.search === "string" ? request.query.search : "";
  const result = await listCustomerNotifications(decodedResult.decoded.customerId, storeId, {
    page,
    limit,
    unreadOnly,
    type,
    search,
  });
  return sendSuccess(response, result.data);
}

export async function getUnreadNotificationCountController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);
  const storeId = String(request.store?._id ?? decodedResult.decoded.storeId ?? "");
  const result = await getCustomerUnreadNotificationCount(decodedResult.decoded.customerId, storeId);
  return sendSuccess(response, result.data);
}

export async function markNotificationReadController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);
  const storeId = String(request.store?._id ?? decodedResult.decoded.storeId ?? "");
  const result = await markCustomerNotificationRead(decodedResult.decoded.customerId, storeId, String(request.params.id));
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function markAllNotificationsReadController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);
  const storeId = String(request.store?._id ?? decodedResult.decoded.storeId ?? "");
  await markAllCustomerNotificationsRead(decodedResult.decoded.customerId, storeId);
  return sendSuccess(response, undefined, "All notifications marked as read");
}

export async function deleteNotificationController(request: SubdomainRequest, response: Response) {
  const decodedResult = await decodeCustomerFromAuth(request);
  if (!decodedResult.ok) return sendFailure(response, decodedResult.message, 401);
  const storeId = String(request.store?._id ?? decodedResult.decoded.storeId ?? "");
  const result = await deleteCustomerNotification(decodedResult.decoded.customerId, storeId, String(request.params.id));
  return result.ok ? sendSuccess(response, undefined, "Notification deleted") : sendFailure(response, result.message, 404);
}
