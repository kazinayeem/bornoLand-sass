import multer from "multer";
import type { RequestHandler, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import {
  bulkDeleteMediaFiles,
  deleteMediaFile,
  downloadMediaFile,
  getMediaFile,
  getMediaFileUsage,
  getStorageStats,
  listMediaFiles,
  renameMediaFile,
  replaceMediaFile,
  uploadMediaFiles,
} from "./media.service.js";
import { DEFAULT_MAX_FILE_SIZE_MB } from "./media.constants.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (Number(process.env.MEDIA_MAX_FILE_SIZE_MB) || DEFAULT_MAX_FILE_SIZE_MB) * 1024 * 1024 },
});

export const mediaUploadMiddleware: RequestHandler = upload.array("files", 20) as RequestHandler;

async function verifyStoreOwner(storeId: string, userId?: string) {
  return Boolean(await StoreModel.findOne({ _id: storeId, userId }).lean());
}

export async function listMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const { search, folder, fileType, sort, page, limit, usage, mimeType } = request.query as Record<string, string>;
  const result = await listMediaFiles(storeId, {
    search,
    folder,
    fileType,
    sort,
    usage,
    mimeType,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  return sendSuccess(response, result.data);
}

export async function getMediaStatsController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const stats = await getStorageStats(storeId);
  return sendSuccess(response, { stats });
}

export async function getMediaFileController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getMediaFile(storeId, id);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function uploadMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }

  const files = (request.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) return sendFailure(response, "No files uploaded");

  const { folder, tags } = request.body as { folder?: string; tags?: string };
  const parsedTags = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const result = await uploadMediaFiles(
    storeId,
    files.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype, size: f.size })),
    { folder, uploaderId: request.user?.userId, tags: parsedTags }
  );

  if (result.data?.files?.length) {
    for (const file of result.data.files as Array<{ id?: string; _id?: string; displayName?: string; originalName?: string }>) {
      await recordAuditFromRequest(request, {
        action: AUDIT_ACTIONS.MEDIA_UPLOADED,
        module: AUDIT_MODULES.MEDIA,
        entityType: "MediaFile",
        entityId: file.id ?? String(file._id),
        entityName: file.displayName ?? file.originalName,
        storeId,
      });
    }
  }

  return sendSuccess(response, result.data, "Upload complete", 201);
}

export async function renameMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  const { displayName } = request.body as { displayName?: string };
  if (!displayName) return sendFailure(response, "Display name required");
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await renameMediaFile(storeId, id, displayName);
  if (result.ok) {
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.MEDIA_RENAMED,
      module: AUDIT_MODULES.MEDIA,
      entityType: "MediaFile",
      entityId: id,
      entityName: displayName,
      storeId,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "File renamed") : sendFailure(response, result.message, 404);
}

export async function deleteMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  const force = String(request.query.force ?? "") === "true";
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await deleteMediaFile(storeId, id, request.user?.userId, { force });
  if (!result.ok) {
    const status = "code" in result && result.code === "MEDIA_IN_USE" ? 409 : 404;
    return response.status(status).json({
      success: false,
      message: result.message,
      code: "code" in result ? result.code : undefined,
      data: "data" in result ? result.data : undefined,
    });
  }
  await recordAuditFromRequest(request, {
    action: AUDIT_ACTIONS.MEDIA_DELETED,
    module: AUDIT_MODULES.MEDIA,
    entityType: "MediaFile",
    entityId: id,
    storeId,
  });
  return sendSuccess(response, result.data, "File deleted");
}

export async function getMediaUsageController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getMediaFileUsage(storeId, id);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function replaceMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  const { newMediaFileId } = request.body as { newMediaFileId?: string };
  if (!newMediaFileId) return sendFailure(response, "newMediaFileId required");
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await replaceMediaFile(storeId, id, newMediaFileId);
  if (result.ok) {
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.MEDIA_REPLACED,
      module: AUDIT_MODULES.MEDIA,
      entityType: "MediaFile",
      entityId: id,
      storeId,
      metadata: { newMediaFileId },
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Media replaced") : sendFailure(response, result.message, 404);
}

export async function downloadMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await downloadMediaFile(storeId, id);
  if (!result.ok) return sendFailure(response, result.message, 404);
  await recordAuditFromRequest(request, {
    action: AUDIT_ACTIONS.MEDIA_DOWNLOADED,
    module: AUDIT_MODULES.MEDIA,
    entityType: "MediaFile",
    entityId: id,
    storeId,
    entityName: result.data.fileName,
  });
  response.setHeader("Content-Type", result.data.mimeType);
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(result.data.fileName)}"`
  );
  return response.sendFile(result.data.path);
}

export async function bulkDeleteMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const { fileIds, force } = request.body as { fileIds?: string[]; force?: boolean };
  if (!fileIds?.length) return sendFailure(response, "fileIds required");
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await bulkDeleteMediaFiles(storeId, fileIds, request.user?.userId, { force });
  return sendSuccess(response, result.data, "Bulk delete complete");
}
