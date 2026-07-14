/**
 * store-upload-cleanup.ts
 *
 * Permanently deletes all uploaded files that belong to a single store,
 * for both the local-filesystem and S3 storage providers.
 *
 * SAFETY RULES
 * ─────────────
 * • Local:  the resolved folder path MUST start with UPLOAD_ROOT/stores/.
 *           Any path that escapes that boundary (e.g. via "..") is rejected.
 * • S3:     the key prefix MUST start with "stores/".
 *           An empty or root prefix is rejected.
 *
 * USAGE
 * ─────
 * Called AFTER the MongoDB transaction has committed so that a filesystem
 * failure never rolls back a completed database delete.
 */

import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  type ObjectIdentifier,
} from "@aws-sdk/client-s3";
import { getStorageProvider } from "./providers/index.js";
import { getUploadRoot } from "./providers/local-storage.provider.js";

// ─── Result type ──────────────────────────────────────────────────────────────

export type UploadCleanupResult =
  | { ok: true;  skipped: false; folderPath: string }
  | { ok: true;  skipped: true;  reason: string }
  | { ok: false; error: string };

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Delete every uploaded file that belongs to `storeSlug`.
 *
 * @param storeSlug  The store's URL slug (used as the folder/prefix name).
 * @returns          A result object describing what happened — never throws.
 */
export async function deleteStoreUploadFolder(
  storeSlug: string
): Promise<UploadCleanupResult> {
  // Reject path-traversal (../ or ..\), absolute paths, or slashes that could escape the directory
  if (
    !storeSlug ||
    storeSlug.includes("..") ||
    path.isAbsolute(storeSlug) ||
    storeSlug.includes("/") ||
    storeSlug.includes("\\") ||
    /[<>:"|?*\x00-\x1f]/.test(storeSlug)
  ) {
    return { ok: false, error: `Invalid store slug for cleanup: "${storeSlug}"` };
  }

  const provider = getStorageProvider();

  if (provider.name === "s3") {
    return _deleteS3Prefix(storeSlug);
  }

  return _deleteLocalFolder(storeSlug);
}

// ─── Local filesystem cleanup ─────────────────────────────────────────────────

async function _deleteLocalFolder(storeSlug: string): Promise<UploadCleanupResult> {
  const uploadRoot = getUploadRoot();
  const storeRoot  = path.resolve(uploadRoot, "stores");

  // Compute the absolute target folder and validate it stays inside storeRoot
  const target = path.resolve(storeRoot, storeSlug);

  const normalizedTarget = path.normalize(target);
  const normalizedStoreRoot = path.normalize(storeRoot);

  if (!normalizedTarget.startsWith(normalizedStoreRoot + path.sep)) {
    // Path-traversal guard: resolved path escapes the allowed boundary
    const errMsg = `Path traversal detected. Resolved: "${normalizedTarget}" is outside "${normalizedStoreRoot}"`;
    console.error(`[deleteStoreUploadFolder] ${errMsg}`);
    return { ok: false, error: errMsg };
  }

  // Log what we are about to do exactly as specified
  const relativeDisplay = `uploads/stores/${storeSlug}`;
  console.log("Deleting upload folder...");
  console.log("");
  console.log("Folder:");
  console.log("");
  console.log(relativeDisplay);
  console.log("");

  // Check if the folder actually exists first
  try {
    await fs.access(normalizedTarget);
  } catch {
    console.log("Upload folder not found. Skipping cleanup.");
    return { ok: true, skipped: true, reason: "folder does not exist" };
  }

  // Delete recursively using fs.rm
  await fs.rm(normalizedTarget, { recursive: true, force: true });

  // After the store folder is gone, clean any now-empty parent directories
  // (i.e. "stores/" if no other stores remain) — best-effort, non-fatal.
  await _pruneEmptyAncestors(normalizedStoreRoot, uploadRoot);

  console.log("Upload folder deleted successfully.");
  return { ok: true, skipped: false, folderPath: relativeDisplay };
}

/**
 * Walk up from `dir` toward `ceiling`, removing each directory if it is
 * empty. Stops when it reaches `ceiling` or an error occurs.
 */
async function _pruneEmptyAncestors(dir: string, ceiling: string): Promise<void> {
  let current = dir;
  while (current.startsWith(ceiling) && current !== ceiling) {
    try {
      const entries = await fs.readdir(current);
      if (entries.length > 0) break;          // still has siblings — stop
      await fs.rmdir(current);
      current = path.dirname(current);
    } catch {
      break;                                    // ignore all errors during pruning
    }
  }
}

// ─── S3 cleanup ───────────────────────────────────────────────────────────────

async function _deleteS3Prefix(storeSlug: string): Promise<UploadCleanupResult> {
  const bucket = process.env.AWS_S3_BUCKET ?? "";
  if (!bucket) {
    return { ok: false, error: "AWS_S3_BUCKET env var is not set" };
  }

  // The S3 key prefix for this store is always "stores/{slug}/"
  const prefix = `stores/${storeSlug}/`;

  // Reject prefixes that could affect other stores or the bucket root
  if (!prefix.startsWith("stores/") || prefix === "stores/") {
    return { ok: false, error: `Unsafe S3 prefix: "${prefix}"` };
  }

  const relativeDisplay = prefix;
  console.log(`[deleteStoreUploadFolder] Deleting S3 prefix...`);
  console.log(`[deleteStoreUploadFolder] Prefix: ${relativeDisplay}`);

  const client = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials:
      process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
          }
        : undefined,
  });

  let deleted  = 0;
  let continuationToken: string | undefined;

  // Paginate through all objects under the prefix and delete in batches of 1000
  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket:            bucket,
        Prefix:            prefix,
        ContinuationToken: continuationToken,
        MaxKeys:           1000,
      })
    );

    const objects: ObjectIdentifier[] = (list.Contents ?? []).map((obj) => ({
      Key: obj.Key!,
    }));

    if (objects.length === 0) break;

    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: objects, Quiet: true },
      })
    );

    deleted += objects.length;
    continuationToken = list.NextContinuationToken;
  } while (continuationToken);

  if (deleted === 0) {
    console.log(`[deleteStoreUploadFolder] S3 prefix not found or already empty. Skipping cleanup.`);
    return { ok: true, skipped: true, reason: "S3 prefix was empty or did not exist" };
  }

  console.log(`[deleteStoreUploadFolder] Deleted ${deleted} S3 object(s) under "${relativeDisplay}"`);
  console.log(`[deleteStoreUploadFolder] Upload folder deleted successfully.`);
  return { ok: true, skipped: false, folderPath: relativeDisplay };
}
