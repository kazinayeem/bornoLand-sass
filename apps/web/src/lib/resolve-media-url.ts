/**
 * Normalize media URLs for browser display via the Next.js `/api` proxy.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";

  // Data URLs and blob URLs should be passed through as-is
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Already prefixed with /api/uploads/
  if (trimmed.startsWith("/api/uploads/")) return trimmed;
  // Uploads with leading slash
  if (trimmed.startsWith("/uploads/")) return `/api${trimmed}`;
  // Uploads without leading slash
  if (trimmed.startsWith("uploads/")) return `/api/${trimmed}`;
  if (trimmed.startsWith("api/uploads/")) return `/${trimmed}`;

  try {
    const isAbsolute = /^https?:\/\//i.test(trimmed);
    if (!isAbsolute) {
      if (trimmed.startsWith("/")) return trimmed;
      return `/${trimmed}`;
    }

    const parsed = new URL(trimmed);
    const isLoopback =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0";

    // If it points to local API server's upload folder, route through Next.js proxy
    if (isLoopback) {
      if (parsed.pathname.startsWith("/api/uploads/")) {
        return `${parsed.pathname}${parsed.search}`;
      }
      if (parsed.pathname.startsWith("/uploads/")) {
        return `/api${parsed.pathname}${parsed.search}`;
      }
    }

    // Remote external URLs (e.g. Unsplash, Cloudinary, S3): preserve full URL
    return trimmed;
  } catch {
    return trimmed;
  }
}

/** Absolute URL suitable for clipboard / external sharing. */
export function absoluteMediaUrl(url?: string | null): string {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return "";
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) return resolved;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${resolved}`;
  }
  const webBase = process.env.NEXT_PUBLIC_WEB_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (webBase) return `${webBase.replace(/\/$/, "")}${resolved}`;
  return resolved;
}

export function mediaDownloadUrl(storeId: string, fileId: string) {
  return `/api/stores/${storeId}/media/${fileId}/download`;
}
