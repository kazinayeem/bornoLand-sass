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

export function getStoreLogoUrl(
  store?: (Partial<Store> & {
    logo?: string;
    branding?: { logoUrl?: string; logo?: string };
  }) | null
) {
  if (!store) return "";
  const raw =
    store.logoUrl ||
    store.logo ||
    store.branding?.logoUrl ||
    store.branding?.logo ||
    (typeof store.logoMediaId === "object" && store.logoMediaId !== null
      ? (store.logoMediaId as any).publicUrl || (store.logoMediaId as any).thumbnailUrl
      : "");
  return resolveMediaUrl(raw);
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
