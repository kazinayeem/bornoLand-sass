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

/** Alias used by older Builder call sites — maps onto the shared CMS folder. */
export const BUILDER_MEDIA_FOLDER_ALIAS = "builder";

export function mediaFolderLabel(folderId: string) {
  const match = MEDIA_LIBRARY_FOLDERS.find((folder) => folder.id === folderId);
  if (match) return match.label;
  if (folderId === "general") return "General";
  if (folderId === "marketing") return "Marketing";
  if (folderId === "documents") return "Documents";
  if (folderId === BUILDER_MEDIA_FOLDER_ALIAS) return "CMS";
  return folderId;
}

/**
 * Normalize an upload destination into a real store media folder.
 * Invalid / legacy Builder aliases (e.g. "builder") map to "cms".
 */
export function normalizeMediaFolder(folder?: string | null): MediaLibraryFolderId | typeof LEGACY_MEDIA_FOLDERS[number] {
  const value = folder?.trim() || "products";
  if (value === BUILDER_MEDIA_FOLDER_ALIAS) return "cms";
  if (MEDIA_LIBRARY_FOLDERS.some((item) => item.id === value)) return value as MediaLibraryFolderId;
  if ((LEGACY_MEDIA_FOLDERS as readonly string[]).includes(value)) return value as typeof LEGACY_MEDIA_FOLDERS[number];
  return "products";
}

/** Default upload folder when picking media from the Builder (still the shared Store library). */
export const BUILDER_UPLOAD_FOLDER: MediaLibraryFolderId = "cms";
