import fs from "fs/promises";
import path from "path";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "./storage-provider.js";

const UPLOAD_ROOT = process.env.MEDIA_UPLOAD_ROOT ?? path.resolve(process.cwd(), "uploads");

function getMediaPublicBase(): string {
  if (process.env.MEDIA_PUBLIC_BASE_URL) {
    return process.env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  return (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

const PUBLIC_BASE = getMediaPublicBase();

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local" as const;

  private resolvePath(storeSlug: string, folder: string, storedName: string) {
    return path.join(UPLOAD_ROOT, "stores", storeSlug, folder, storedName);
  }

  getPublicUrl(storagePath: string) {
    const relative = storagePath.replace(UPLOAD_ROOT, "").replace(/\\/g, "/");
    return `${PUBLIC_BASE}/uploads${relative}`;
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const storagePath = this.resolvePath(input.storeSlug, input.folder, input.storedName);
    await fs.mkdir(path.dirname(storagePath), { recursive: true });
    await fs.writeFile(storagePath, input.buffer);
    return {
      storagePath,
      publicUrl: this.getPublicUrl(storagePath),
      size: input.buffer.length,
    };
  }

  async delete(storagePath: string) {
    try {
      await fs.unlink(storagePath);
    } catch {
      // ignore missing files during cleanup
    }
    const thumbPath = storagePath.replace(/(\.[^.]+)$/, "-thumb$1");
    try {
      await fs.unlink(thumbPath);
    } catch {
      // no thumbnail
    }
  }
}

export function getUploadRoot() {
  return UPLOAD_ROOT;
}
