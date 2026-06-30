import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { getMediaCategory } from "./media.constants.js";

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
  extension: string;
  thumbnailBuffer?: Buffer;
};

const OPTIMIZE_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function processImageBuffer(buffer: Buffer, mimeType: string): Promise<ProcessedImage | null> {
  if (!OPTIMIZE_MIMES.has(mimeType) && mimeType !== "image/gif") return null;
  if (mimeType === "image/svg+xml" || mimeType === "image/gif") {
    const meta = await sharp(buffer, { animated: mimeType === "image/gif" }).metadata();
    return {
      buffer,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      mimeType,
      extension: mimeType === "image/gif" ? "gif" : "svg",
    };
  }

  const image = sharp(buffer).rotate();
  const meta = await image.metadata();
  let pipeline = image;
  if ((meta.width ?? 0) > 2400) {
    pipeline = pipeline.resize({ width: 2400, withoutEnlargement: true });
  }

  const outputMime = mimeType === "image/png" ? "image/png" : "image/webp";
  const optimized = await pipeline
    .toFormat(outputMime === "image/png" ? "png" : "webp", { quality: 82 })
    .toBuffer();

  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: 320, height: 320, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  return {
    buffer: optimized,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    mimeType: outputMime,
    extension: outputMime === "image/png" ? "png" : "webp",
    thumbnailBuffer: thumb,
  };
}

export async function saveThumbnail(storagePath: string, thumbnailBuffer: Buffer) {
  const ext = path.extname(storagePath);
  const thumbPath = storagePath.replace(ext, `-thumb${ext === ".webp" ? ".webp" : ".webp"}`);
  await fs.mkdir(path.dirname(thumbPath), { recursive: true });
  await fs.writeFile(thumbPath, thumbnailBuffer);
  return thumbPath;
}

export function thumbnailPublicUrl(publicUrl: string) {
  const ext = path.extname(publicUrl);
  return publicUrl.replace(ext, `-thumb.webp`);
}

export { getMediaCategory };
