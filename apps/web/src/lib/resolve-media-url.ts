/**
 * Normalize media URLs for browser display via the Next.js `/api` proxy.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/api/uploads/")) return trimmed;
  if (trimmed.startsWith("/uploads/")) return `/api${trimmed}`;

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.pathname.startsWith("/api/uploads/")) return parsed.pathname;
    if (parsed.pathname.startsWith("/uploads/")) return `/api${parsed.pathname}`;
  } catch {
    return trimmed;
  }

  return trimmed;
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
