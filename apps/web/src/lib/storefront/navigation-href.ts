import type { NavigationItemData } from "@/providers/tenant-provider";

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
    return trimmed;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** Resolve a backend navigation menu item to a storefront href. */
export function resolveNavigationItemHref(item: NavigationItemData): string {
  const rawLink = item.link?.trim() ?? "";
  const referenceId = item.referenceId?.trim() ?? "";

  if (item.isExternal || item.linkType === "external") {
    return rawLink || referenceId || "#";
  }

  switch (item.linkType) {
    case "page":
      return normalizePath(rawLink || referenceId || "/");
    case "category":
      return normalizePath(rawLink || `/category/${referenceId}`);
    case "product":
      return normalizePath(rawLink || `/products/${referenceId}`);
    case "collection":
      return normalizePath(rawLink || `/collections/${referenceId}`);
    case "blog":
      return normalizePath(rawLink || (referenceId ? `/blog/${referenceId}` : "/blog"));
    default:
      return normalizePath(rawLink || referenceId || "#");
  }
}
