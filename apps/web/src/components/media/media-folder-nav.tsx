"use client";

import { MEDIA_LIBRARY_FOLDERS } from "@/lib/media-folders";

export function MediaFolderNav({
  activeFolder,
  onChange,
  layout = "sidebar",
}: {
  activeFolder: string | null;
  onChange: (folderId: string | null) => void;
  layout?: "sidebar" | "horizontal";
}) {
  const items = [
    { id: null as string | null, label: "All Media", icon: "🗂️" },
    ...MEDIA_LIBRARY_FOLDERS.map((folder) => ({ id: folder.id, label: folder.label, icon: folder.icon })),
  ];

  if (layout === "horizontal") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <button
            key={item.id ?? "all"}
            type="button"
            onClick={() => onChange(item.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFolder === item.id
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <nav className="space-y-1">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Folders</p>
      {items.map((item) => (
        <button
          key={item.id ?? "all"}
          type="button"
          onClick={() => onChange(item.id)}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
            activeFolder === item.id
              ? "bg-zinc-900 font-medium text-white"
              : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          }`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
