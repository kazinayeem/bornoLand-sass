export const MEDIA_LIBRARY_FOLDERS = [
  { id: "products", label: "Products", icon: "📁" },
  { id: "categories", label: "Categories", icon: "📁" },
  { id: "brands", label: "Brands", icon: "📁" },
  { id: "banners", label: "Banners", icon: "📁" },
  { id: "cms", label: "CMS", icon: "📁" },
  { id: "themes", label: "Themes", icon: "📁" },
  { id: "logos", label: "Logos", icon: "📁" },
  { id: "blog", label: "Blog", icon: "📁" },
  { id: "ai-images", label: "AI Images", icon: "📁" },
] as const;

export type MediaLibraryFolderId = (typeof MEDIA_LIBRARY_FOLDERS)[number]["id"];

export const LEGACY_MEDIA_FOLDERS = ["general", "marketing", "documents"] as const;

export function mediaFolderLabel(folderId: string) {
  const match = MEDIA_LIBRARY_FOLDERS.find((folder) => folder.id === folderId);
  if (match) return match.label;
  if (folderId === "general") return "General";
  if (folderId === "marketing") return "Marketing";
  if (folderId === "documents") return "Documents";
  return folderId;
}

export function normalizeMediaFolder(folder?: string | null): MediaLibraryFolderId | typeof LEGACY_MEDIA_FOLDERS[number] | "products" {
  const value = folder?.trim() || "products";
  if (MEDIA_LIBRARY_FOLDERS.some((item) => item.id === value)) return value as MediaLibraryFolderId;
  if ((LEGACY_MEDIA_FOLDERS as readonly string[]).includes(value)) return value as typeof LEGACY_MEDIA_FOLDERS[number];
  return "products";
}
