import type { Store } from "@/redux/api/store-api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

export function getStoreInitials(storeName?: string, shortName?: string) {
  const source = (shortName || storeName || "").trim();
  if (!source) return "ST";
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
}

export function getStoreDisplayName(store?: Pick<Store, "name" | "shortName"> | null) {
  return store?.shortName?.trim() || store?.name || "Store";
}

export function getStoreLogoUrl(store?: Pick<Store, "logoUrl"> | null) {
  return resolveMediaUrl(store?.logoUrl);
}

export function getStoreFaviconUrl(store?: Pick<Store, "faviconUrl" | "logoUrl"> | null) {
  return resolveMediaUrl(store?.faviconUrl || store?.logoUrl);
}

export function getStoreBrandColors(store?: Pick<Store, "brandColor" | "accentColor"> | null) {
  return {
    brandColor: store?.brandColor || "#2563eb",
    accentColor: store?.accentColor || "#0f172a",
  };
}
