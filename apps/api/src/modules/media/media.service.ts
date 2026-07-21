import path from "path";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../stores/store.model.js";
import { checkFeature, checkLimit, checkSubscription } from "../features/feature-access.service.js";
import { MediaFileModel } from "./media-file.model.js";
import { StorageUsageModel } from "./storage-usage.model.js";
import {
  adjustStorageOnDelete,
  adjustStorageOnUpload,
  findDuplicateByHash,
  getStoragePlanSettings,
  getStorageStats,
  hashBuffer,
  logUploadAction,
  syncStorageUsage,
} from "./media-storage.service.js";
import { getStorageProvider } from "./providers/index.js";
import { processImageBuffer, saveThumbnail, thumbnailPublicUrl } from "./media-image.processor.js";
import {
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_FILE_SIZE_MB,
  getMediaCategory,
  MEDIA_FOLDERS,
  MIME_TO_EXTENSION,
  type MediaFolder,
} from "./media.constants.js";
import {
  getMediaUsage,
  getReferenceCounts,
  replaceMediaReferences,
} from "./media-reference.service.js";
import { MediaReferenceModel } from "./media-reference.model.js";
import { serializeMediaFile, resolveStorageFilePath } from "./media-url.util.js";
import fs from "fs/promises";

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
}

function uniqueStoredName(originalName: string, ext: string) {
  const base = sanitizeName(path.parse(originalName).name);
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export async function validateUpload(storeId: string, mimeType: string, size: number) {
  const sub = await checkSubscription(storeId);
  if (!sub.allowed) return { ok: false as const, message: sub.message ?? "Subscription inactive" };

  const feature = await checkFeature(storeId, "media");
  if (!feature.allowed) return { ok: false as const, message: feature.message ?? "Media not available on your plan" };

  const usageDoc = (await StorageUsageModel.findOne({ storeId }).lean()) as { uploadsSuspended?: boolean } | null;
  if (usageDoc?.uploadsSuspended) {
    return { ok: false as const, message: "Uploads are suspended for this store" };
  }

  const store = (await StoreModel.findById(storeId).lean()) as { planId?: unknown } | null;
  const planSettings = store?.planId ? await getStoragePlanSettings(String(store.planId)) : null;

  const allowed =
    planSettings?.allowedMimeTypes?.length
      ? planSettings.allowedMimeTypes.includes(mimeType)
      : ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number]);

  if (!allowed) return { ok: false as const, message: "File type not allowed on your plan" };

  const maxFileMB = planSettings?.maxFileSizeMB ?? DEFAULT_MAX_FILE_SIZE_MB;
  if (size > maxFileMB * 1024 * 1024) {
    return { ok: false as const, message: `File exceeds maximum size of ${maxFileMB} MB` };
  }

  const stats = await getStorageStats(storeId);
  if (!stats.unlimited) {
    if (stats.limitBytes <= 0) {
      return { ok: false as const, message: "Storage is not included in your current plan. Upgrade to upload files." };
    }
    if (stats.usedBytes + size > stats.limitBytes) {
      return { ok: false as const, message: "Storage limit reached. Upgrade your plan to upload more files." };
    }
  }

  const storageLimit = await checkLimit(storeId, "storage");
  if (!storageLimit.allowed) {
    return { ok: false as const, message: storageLimit.message ?? "Storage limit reached" };
  }

  return { ok: true as const, planSettings, stats };
}

export async function uploadMediaFiles(
  storeId: string,
  files: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
  options: { folder?: string; uploaderId?: string; tags?: string[] }
) {
  await connectDatabase();
  const store = (await StoreModel.findById(storeId).lean()) as { slug: string; tenantId?: unknown } | null;
  if (!store) return { ok: false as const, message: "Store not found" };

  const folder = MEDIA_FOLDERS.includes((options.folder ?? "products") as MediaFolder)
    ? (options.folder as MediaFolder)
    : "products";

  const provider = getStorageProvider();
  const uploaded: unknown[] = [];
  const errors: Array<{ name: string; message: string }> = [];

  for (const file of files) {
    try {
      const validation = await validateUpload(storeId, file.mimetype, file.size);
      if (!validation.ok) {
        errors.push({ name: file.originalname, message: validation.message });
        await logUploadAction({
          storeId,
          uploaderId: options.uploaderId,
          action: "upload",
          fileName: file.originalname,
          size: file.size,
          status: "failed",
          message: validation.message,
        });
        continue;
      }

      const hash = hashBuffer(file.buffer);
      const duplicate = await findDuplicateByHash(storeId, hash);
      if (duplicate) {
        uploaded.push(serializeMediaFile(duplicate as Record<string, unknown>));
        continue;
      }

      let buffer = file.buffer;
      let mimeType = file.mimetype;
      let width = 0;
      let height = 0;
      let thumbnailUrl = "";

      const processed = await processImageBuffer(file.buffer, file.mimetype);
      if (processed) {
        buffer = processed.buffer;
        mimeType = processed.mimeType;
        width = processed.width;
        height = processed.height;
      }

      const ext = MIME_TO_EXTENSION[mimeType] ?? path.extname(file.originalname).replace(".", "") ?? "bin";
      const storedName = uniqueStoredName(file.originalname, ext);

      const result = await provider.upload({
        buffer,
        mimeType,
        storeSlug: store.slug,
        folder,
        storedName,
      });

      if (processed?.thumbnailBuffer && provider.name === "local") {
        const thumbPath = await saveThumbnail(result.storagePath, processed.thumbnailBuffer);
        thumbnailUrl = thumbnailPublicUrl(result.publicUrl);
        void thumbPath;
      } else if (processed?.thumbnailBuffer && provider.name === "s3") {
        const thumbName = storedName.replace(`.${ext}`, `-thumb.webp`);
        const thumbResult = await provider.upload({
          buffer: processed.thumbnailBuffer,
          mimeType: "image/webp",
          storeSlug: store.slug,
          folder,
          storedName: thumbName,
        });
        thumbnailUrl = thumbResult.publicUrl;
      }

      const fileType = getMediaCategory(mimeType);

      const media = await MediaFileModel.create({
        storeId,
        tenantId: store.tenantId,
        uploaderId: options.uploaderId,
        folder,
        originalName: file.originalname,
        storedName,
        displayName: file.originalname,
        fileType,
        mimeType,
        extension: ext,
        size: result.size,
        width,
        height,
        hash,
        storageProvider: provider.name,
        storagePath: result.storagePath,
        publicUrl: result.publicUrl,
        thumbnailUrl,
        tags: options.tags ?? [],
      });

      await adjustStorageOnUpload(storeId, result.size, fileType);
      await logUploadAction({
        storeId,
        mediaFileId: media._id,
        uploaderId: options.uploaderId,
        action: "upload",
        fileName: file.originalname,
        size: result.size,
        status: "success",
      });

      uploaded.push(serializeMediaFile(media.toObject() as Record<string, unknown>));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      errors.push({ name: file.originalname, message });
      await logUploadAction({
        storeId,
        uploaderId: options.uploaderId,
        action: "upload",
        fileName: file.originalname,
        size: file.size,
        status: "failed",
        message,
      });
    }
  }

  return {
    ok: true as const,
    data: { files: uploaded, errors, stats: await getStorageStats(storeId) },
  };
}

export async function importMediaFromUrl(
  storeId: string,
  url: string,
  options?: { folder?: string; displayName?: string; uploaderId?: string }
) {
  await connectDatabase();
  const store = (await StoreModel.findById(storeId).lean()) as { slug: string; tenantId?: unknown } | null;
  if (!store) return { ok: false as const, message: "Store not found" };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false as const, message: "Invalid URL format. Please enter a valid URL starting with http:// or https://" };
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false as const, message: "Only http and https URLs are supported" };
  }

  const targetFolder = options?.folder ?? "products";
  const folder = MEDIA_FOLDERS.includes(targetFolder as MediaFolder) ? (targetFolder as MediaFolder) : "products";

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
      const status = response.status;
      const text = status === 404 ? "URL not found (404)" : status === 403 ? "URL access forbidden (403)" : `Failed to fetch URL: ${response.statusText} (${status})`;
      return { ok: false as const, message: text };
    }

    const contentType = (response.headers.get("content-type") ?? "application/octet-stream").split(";")[0].trim();
    if (!contentType.startsWith("image/") || !ALLOWED_MIME_TYPES.includes(contentType as (typeof ALLOWED_MIME_TYPES)[number])) {
      return { ok: false as const, message: `URL does not point to a supported image type. Got "${contentType}"` };
    }
    const contentLength = response.headers.get("content-length");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const size = contentLength ? Number(contentLength) : buffer.length;

    const validation = await validateUpload(storeId, contentType, size);
    if (!validation.ok) return { ok: false as const, message: validation.message };

    const hash = hashBuffer(buffer);
    const duplicate = await findDuplicateByHash(storeId, hash);
    if (duplicate) {
      return { ok: true as const, data: { file: serializeMediaFile(duplicate as Record<string, unknown>) } };
    }

    let processedBuffer: Buffer = buffer;
    let processedMime = contentType;
    let width = 0;
    let height = 0;
    let thumbnailUrl = "";

    const processed = await processImageBuffer(buffer, contentType);
    if (processed) {
      processedBuffer = processed.buffer;
      processedMime = processed.mimeType;
      width = processed.width;
      height = processed.height;
    }

    const urlPath = new URL(url).pathname;
    const originalName = path.basename(urlPath) || "imported-file";
    const ext = MIME_TO_EXTENSION[processedMime] || path.extname(originalName).replace(".", "") || "bin";
    const storedName = uniqueStoredName(originalName, ext);
    const fileType = getMediaCategory(processedMime);

    const provider = getStorageProvider();
    const result = await provider.upload({
      buffer: processedBuffer,
      mimeType: processedMime,
      storeSlug: store.slug,
      folder,
      storedName,
    });

    if (processed?.thumbnailBuffer && provider.name === "local") {
      const thumbPath = await saveThumbnail(result.storagePath, processed.thumbnailBuffer);
      thumbnailUrl = thumbnailPublicUrl(result.publicUrl);
      void thumbPath;
    } else if (processed?.thumbnailBuffer && provider.name === "s3") {
      const thumbName = storedName.replace(`.${ext}`, `-thumb.webp`);
      const thumbResult = await provider.upload({
        buffer: processed.thumbnailBuffer,
        mimeType: "image/webp",
        storeSlug: store.slug,
        folder,
        storedName: thumbName,
      });
      thumbnailUrl = thumbResult.publicUrl;
    }

    const mediaFile = await MediaFileModel.create({
      storeId,
      folder,
      originalName,
      displayName: options?.displayName ?? originalName,
      fileType,
      mimeType: processedMime,
      extension: ext,
      size: result.size ?? processedBuffer.length,
      width,
      height,
      storagePath: result.storagePath,
      publicUrl: result.publicUrl,
      thumbnailUrl: thumbnailUrl || "",
      hash,
      uploadedBy: options?.uploaderId,
      tags: [],
    });

    await adjustStorageOnUpload(storeId, result.size ?? processedBuffer.length, fileType);

    await logUploadAction({
      storeId,
      uploaderId: options?.uploaderId,
      action: "import-url",
      fileName: originalName,
      size: result.size ?? processedBuffer.length,
      status: "success",
      message: `Imported from URL: ${url}`,
    });

    return { ok: true as const, data: { file: serializeMediaFile(mediaFile.toObject() as Record<string, unknown>) } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logUploadAction({
      storeId,
      uploaderId: options?.uploaderId,
      action: "import-url",
      fileName: url,
      size: 0,
      status: "failed",
      message,
    });
    return { ok: false as const, message };
  }
}

export async function listMediaFiles(
  storeId: string,
  filters?: {
    search?: string;
    folder?: string;
    fileType?: string;
    mimeType?: string;
    usage?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }
) {
  await connectDatabase();
  const query: Record<string, unknown> = { storeId, isDeleted: false };
  if (filters?.folder) query.folder = filters.folder;

  if (filters?.fileType) {
    if (filters.fileType === "archive") {
      query.extension = { $in: ["zip", "rar", "7z", "tar", "gz"] };
    } else if (filters.fileType === "pdf") {
      query.mimeType = "application/pdf";
    } else {
      query.fileType = filters.fileType;
    }
  }

  if (filters?.mimeType) {
    query.mimeType = filters.mimeType;
  }

  if (filters?.search) {
    const term = filters.search.trim();
    query.$or = [
      { originalName: { $regex: term, $options: "i" } },
      { displayName: { $regex: term, $options: "i" } },
      { tags: { $regex: term, $options: "i" } },
      { folder: { $regex: term, $options: "i" } },
      { extension: { $regex: term, $options: "i" } },
      { mimeType: { $regex: term, $options: "i" } },
      { fileType: { $regex: term, $options: "i" } },
    ];
  }

  if (filters?.usage === "used" || filters?.usage === "unused") {
    const usedIds = await MediaReferenceModel.distinct("mediaFileId", { storeId });
    query._id = filters.usage === "used" ? { $in: usedIds } : { $nin: usedIds };
  }

  const page = Math.max(1, filters?.page ?? 1);
  const limit = Math.min(500, Math.max(1, filters?.limit ?? 200));
  const skip = (page - 1) * limit;

  let sortField = "createdAt";
  let sortDir: 1 | -1 = -1;
  switch (filters?.sort) {
    case "oldest":
      sortField = "createdAt";
      sortDir = 1;
      break;
    case "largest":
      sortField = "size";
      sortDir = -1;
      break;
    case "smallest":
      sortField = "size";
      sortDir = 1;
      break;
    case "name-asc":
      sortField = "displayName";
      sortDir = 1;
      break;
    case "name-desc":
      sortField = "displayName";
      sortDir = -1;
      break;
    case "newest":
    default:
      sortField = "createdAt";
      sortDir = -1;
      break;
  }

  const [files, countsResult] = await Promise.all([
    MediaFileModel.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(limit).lean(),
    MediaFileModel.aggregate<{ fileType: string | null; count: number }>([
      { $match: query },
      { $group: { _id: "$fileType", count: { $sum: 1 } } },
    ]),
  ]);

  const total = countsResult.reduce((s, r) => s + r.count, 0);
  const imageCount = countsResult.find((r) => r.fileType === "image")?.count ?? 0;
  const documentCount = countsResult.find((r) => r.fileType === "document")?.count ?? 0;
  const videoCount = countsResult.find((r) => r.fileType === "video")?.count ?? 0;

  const referenceCounts = await getReferenceCounts(
    storeId,
    files.map((file) => String(file._id))
  );
  const enrichedFiles = files.map((file) =>
    serializeMediaFile({
      ...file,
      referenceCount: referenceCounts.get(String(file._id)) ?? 0,
    } as Record<string, unknown>)
  );

  const globalStats = await getStorageStats(storeId);
  const listStats = {
    ...globalStats,
    fileCount: total,
    imageCount,
    documentCount,
    videoCount,
  };

  return {
    ok: true as const,
    data: { files: enrichedFiles, total, page, limit, stats: listStats, globalStats },
  };
}

export async function renameMediaFile(storeId: string, fileId: string, displayName: string) {
  await connectDatabase();
  const file = await MediaFileModel.findOneAndUpdate(
    { _id: fileId, storeId, isDeleted: false },
    { $set: { displayName } },
    { new: true }
  ).lean();
  if (!file) return { ok: false as const, message: "File not found" };
  return { ok: true as const, data: { file: serializeMediaFile(file as Record<string, unknown>) } };
}

export async function deleteMediaFile(
  storeId: string,
  fileId: string,
  uploaderId?: string,
  options?: { force?: boolean }
) {
  await connectDatabase();
  const file = await MediaFileModel.findOne({ _id: fileId, storeId, isDeleted: false });
  if (!file) return { ok: false as const, message: "File not found" };

  const usage = await getMediaUsage(storeId, fileId);
  if (usage.total > 0 && !options?.force) {
    return {
      ok: false as const,
      message: "This file is currently in use",
      code: "MEDIA_IN_USE",
      data: { usage },
    };
  }

  const provider = getStorageProvider();
  await provider.delete(file.storagePath);
  if (file.thumbnailUrl) {
    const thumbPath = file.storagePath.replace(/(\.[^.]+)$/, "-thumb.webp");
    await provider.delete(thumbPath);
  }

  file.isDeleted = true;
  file.deletedAt = new Date();
  await file.save();

  await MediaReferenceModel.deleteMany({ storeId, mediaFileId: fileId });

  await adjustStorageOnDelete(storeId, file.size ?? 0, file.fileType ?? "other");
  await logUploadAction({
    storeId,
    mediaFileId: file._id,
    uploaderId,
    action: "delete",
    fileName: file.originalName,
    size: file.size,
    status: "success",
  });

  return { ok: true as const, data: { stats: await getStorageStats(storeId) } };
}

export async function bulkDeleteMediaFiles(
  storeId: string,
  fileIds: string[],
  uploaderId?: string,
  options?: { force?: boolean }
) {
  const results = await Promise.all(
    fileIds.map((id) => deleteMediaFile(storeId, id, uploaderId, options))
  );
  const failed = results.filter((r) => !r.ok);
  return {
    ok: true as const,
    data: {
      deleted: fileIds.length - failed.length,
      failed: failed.length,
      failures: failed.map((r) => ("message" in r ? r.message : "Delete failed")),
      stats: await getStorageStats(storeId),
    },
  };
}

export async function getMediaFileUsage(storeId: string, fileId: string) {
  await connectDatabase();
  const file = await MediaFileModel.findOne({ _id: fileId, storeId, isDeleted: false }).lean();
  if (!file) return { ok: false as const, message: "File not found" };
  const usage = await getMediaUsage(storeId, fileId);
  return { ok: true as const, data: { file: serializeMediaFile(file as Record<string, unknown>), usage } };
}

export async function replaceMediaFile(storeId: string, fileId: string, newMediaFileId: string) {
  await connectDatabase();
  const file = await MediaFileModel.findOne({ _id: fileId, storeId, isDeleted: false }).lean();
  if (!file) return { ok: false as const, message: "File not found" };
  if (fileId === newMediaFileId) {
    return { ok: true as const, data: { file: serializeMediaFile(file as Record<string, unknown>), updated: 0 } };
  }
  const result = await replaceMediaReferences(storeId, fileId, newMediaFileId);
  if (!result.ok) return result;
  return {
    ok: true as const,
    data: { ...result.data, file: serializeMediaFile(file as Record<string, unknown>) },
  };
}

export async function getMediaFile(storeId: string, fileId: string) {
  await connectDatabase();
  const file = await MediaFileModel.findOne({ _id: fileId, storeId, isDeleted: false }).lean();
  if (!file) return { ok: false as const, message: "File not found" };
  const usage = await getMediaUsage(storeId, fileId);
  return {
    ok: true as const,
    data: {
      file: serializeMediaFile({ ...file, referenceCount: usage.total } as Record<string, unknown>),
      usage,
    },
  };
}

export async function downloadMediaFile(storeId: string, fileId: string) {
  await connectDatabase();
  const file = await MediaFileModel.findOne({ _id: fileId, storeId, isDeleted: false }).lean();
  if (!file) return { ok: false as const, message: "File not found" };
  const doc = file as unknown as { storagePath: string; displayName?: string; originalName: string; mimeType: string };
  const resolved = resolveStorageFilePath(doc.storagePath);
  if (!resolved) return { ok: false as const, message: "Invalid file path" };
  try {
    await fs.access(resolved);
  } catch {
    return { ok: false as const, message: "File not found on disk" };
  }
  return {
    ok: true as const,
    data: {
      path: resolved,
      fileName: doc.displayName || doc.originalName,
      mimeType: doc.mimeType,
    },
  };
}

export { getStorageStats, syncStorageUsage };
