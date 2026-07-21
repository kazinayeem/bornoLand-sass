import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { getUploadRoot } from "../media/providers/local-storage.provider.js";
import { MediaFileModel } from "../media/media-file.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type StoreBrandingLogoSource = {
  logoUrl?: string | null;
  logoMediaId?: unknown;
  faviconUrl?: string | null;
  faviconMediaId?: unknown;
};

/**
 * Appearance → Branding is the single source of truth.
 * Priority: store logo → favicon → null (caller draws initials).
 * Never falls back to product images, avatars, or placeholders.
 */
export async function resolveStoreBrandingLogoBuffer(
  branding: StoreBrandingLogoSource,
): Promise<{ buffer: Buffer | null; source: string | null }> {
  const attempts: Array<{ label: string; urls: string[] }> = [];

  const logoMedia = await loadMediaRefs(branding.logoMediaId);
  if (logoMedia.urls.length) {
    attempts.push({ label: "branding.logoMediaId", urls: logoMedia.urls });
  }
  if (branding.logoUrl?.trim()) {
    attempts.push({ label: "branding.logoUrl", urls: [branding.logoUrl.trim()] });
  }

  const faviconMedia = await loadMediaRefs(branding.faviconMediaId);
  if (faviconMedia.urls.length) {
    attempts.push({ label: "branding.faviconMediaId", urls: faviconMedia.urls });
  }
  if (branding.faviconUrl?.trim()) {
    attempts.push({ label: "branding.faviconUrl", urls: [branding.faviconUrl.trim()] });
  }

  for (const attempt of attempts) {
    for (const url of attempt.urls) {
      const buffer = await loadImageBufferForPdf(url);
      if (buffer) {
        return { buffer, source: `${attempt.label}:${url}` };
      }
    }
  }

  return { buffer: null, source: null };
}

async function loadMediaRefs(mediaId?: unknown): Promise<{ urls: string[] }> {
  if (!mediaId) return { urls: [] };
  try {
    const media = await MediaFileModel.findById(mediaId).lean();
    if (!media || media.isDeleted) return { urls: [] };
    // storagePath first — absolute disk path, most reliable for PDF generation
    const urls = [media.storagePath, media.publicUrl, media.thumbnailUrl]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);
    return { urls };
  } catch {
    return { urls: [] };
  }
}

function uploadRoots(): string[] {
  const roots = new Set<string>();
  const add = (value?: string | null) => {
    if (!value) return;
    roots.add(path.resolve(value));
  };

  add(getUploadRoot());
  add(process.env.MEDIA_UPLOAD_ROOT);
  add(path.resolve(process.cwd(), "uploads"));
  add(path.resolve(process.cwd(), "apps/api/uploads"));
  // modules/orders → apps/api/uploads
  add(path.resolve(__dirname, "../../uploads"));
  add(path.resolve(__dirname, "../../../uploads"));

  return [...roots];
}

/** Map any stored branding URL shape onto local upload file paths. */
export function brandingUrlToLocalPaths(source: string): string[] {
  const trimmed = source.trim();
  if (!trimmed) return [];

  const paths = new Set<string>();

  // Absolute filesystem path (MediaFile.storagePath)
  if (path.isAbsolute(trimmed) && !trimmed.startsWith("/api/") && !trimmed.startsWith("/uploads")) {
    paths.add(trimmed);
  }

  let relative = trimmed
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/api\/uploads\//i, "")
    .replace(/^\/uploads\//i, "")
    .replace(/^api\/uploads\//i, "")
    .replace(/^uploads\//i, "")
    .replace(/^\/+/, "");

  // "/api/uploads/..." sometimes arrives without leading slash handling above
  if (relative.startsWith("api/uploads/")) {
    relative = relative.slice("api/uploads/".length);
  }

  for (const root of uploadRoots()) {
    if (!relative) continue;
    paths.add(path.join(root, relative));
    if (relative.startsWith("stores/")) {
      paths.add(path.join(root, relative));
    }
  }

  return [...paths];
}

async function toPngBuffer(input: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(input).rotate().png({ quality: 92 }).toBuffer();
  } catch {
    return null;
  }
}

export async function loadImageBufferForPdf(source?: string | null): Promise<Buffer | null> {
  if (!source?.trim()) return null;
  const raw = source.trim();

  // 1) Local disk candidates (covers /api/uploads, /uploads, absolute storagePath)
  for (const candidate of brandingUrlToLocalPaths(raw)) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        const converted = await toPngBuffer(fs.readFileSync(candidate));
        if (converted) return converted;
      }
    } catch {
      // continue
    }
  }

  // 2) Remote / absolute HTTP(S) URL
  if (/^https?:\/\//i.test(raw)) {
    try {
      const response = await fetch(raw);
      if (!response.ok) return null;
      return await toPngBuffer(Buffer.from(await response.arrayBuffer()));
    } catch {
      return null;
    }
  }

  // 3) Relative /api/uploads → hit local API static /uploads
  if (raw.startsWith("/api/uploads/") || raw.startsWith("/uploads/")) {
    const apiBase = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(
      /\/$/,
      "",
    );
    const pathname = raw.startsWith("/api/uploads/")
      ? raw.replace(/^\/api\/uploads\//, "/uploads/")
      : raw;
    try {
      const response = await fetch(`${apiBase}${pathname}`);
      if (!response.ok) return null;
      return await toPngBuffer(Buffer.from(await response.arrayBuffer()));
    } catch {
      return null;
    }
  }

  return null;
}

/** When branding is saved, lock logoUrl/faviconUrl to the MediaFile public URL. */
export async function canonicalizeBrandingMediaUrls(input: {
  logoUrl?: string;
  logoMediaId?: string | null;
  faviconUrl?: string;
  faviconMediaId?: string | null;
}) {
  const next = { ...input };

  if (input.logoMediaId) {
    const media = await MediaFileModel.findById(input.logoMediaId).lean();
    if (media && !media.isDeleted) {
      next.logoUrl = media.publicUrl || media.thumbnailUrl || input.logoUrl || "";
      next.logoMediaId = String(media._id);
    }
  }

  if (input.faviconMediaId) {
    const media = await MediaFileModel.findById(input.faviconMediaId).lean();
    if (media && !media.isDeleted) {
      next.faviconUrl = media.publicUrl || media.thumbnailUrl || input.faviconUrl || "";
      next.faviconMediaId = String(media._id);
    }
  }

  return next;
}
