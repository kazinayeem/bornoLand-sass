"use client";

import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { addSection, openSectionLibrary, setActiveTab, setEditingZone } from "@/redux/slices/builder-slice";
import {
  Plus,
  Layout, Image, Star, Mail, ShoppingBag, Package, Grid3x3, Tags,
  Percent, MessageSquareQuote, FileText, HelpCircle, Users, Instagram,
  Megaphone, Zap, Video, Minimize, Columns2, AtSign,
} from "lucide-react";
import {
  LIBRARY_CATEGORIES,
  POPULAR_LIBRARY_TYPES,
  getLibraryDefaults,
  getLibrarySectionByType,
  type LibraryCategoryId,
} from "@/lib/section-library-catalog";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout, Image, Star, Mail, ShoppingBag, Package, Grid3x3, Tags,
  Percent, MessageSquareQuote, FileText, HelpCircle, Users, Instagram,
  Megaphone, Zap, Video, Minimize, Columns2, AtSign,
};

function SectionIcon({ icon }: { icon: string }) {
  const Icon = iconMap[icon] || Layout;
  return <Icon className="h-4 w-4" />;
}

export function SectionPanel() {
  const dispatch = useDispatch();

  const popular = useMemo(
    () => POPULAR_LIBRARY_TYPES.map((type) => getLibrarySectionByType(type)).filter(Boolean),
    [],
  );

  const handleAdd = (type: string, label: string, libraryCategory: LibraryCategoryId) => {
    const zone =
      libraryCategory === "header" ? "header"
      : libraryCategory === "footer" ? "footer"
      : "body";
    dispatch(setEditingZone(zone));
    dispatch(addSection({
      id: `${type}-${Date.now()}`,
      type,
      label,
      visible: true,
      props: getLibraryDefaults(type),
    }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-apple-hairline px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Sections</p>
        <h2 className="mt-1 text-sm font-semibold text-apple-ink">Build your page section by section</h2>
        <p className="mt-1 text-xs leading-5 text-apple-ink-muted-48">
          Browse by purpose — heroes, products, promotions, and more.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => dispatch(openSectionLibrary({ insertPosition: null, targetZone: "body" }))}
            className="flex items-center gap-1 rounded-xl bg-apple-ink px-3 py-2 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-3 w-3" /> Open Library
          </button>
          <button
            type="button"
            onClick={() => dispatch(setActiveTab("layers"))}
            className="rounded-xl border border-apple-hairline px-3 py-2 text-[11px] font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          >
            Manage Layers
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 rounded-3xl border border-apple-hairline bg-apple-canvas-parchment/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Popular</p>
          <div className="mt-3 grid gap-2">
            {popular.map((section) => section && (
              <button
                key={section.type}
                type="button"
                onClick={() => handleAdd(section.type, section.label, section.libraryCategory)}
                className="flex items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left transition-all hover:border-apple-hairline hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-100 text-apple-ink-muted-48">
                  <SectionIcon icon={section.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-apple-ink">{section.label}</p>
                  <p className="truncate text-[11px] text-apple-ink-muted-48">{section.description}</p>
                </div>
                <Plus className="h-4 w-4 text-zinc-300" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-apple-hairline bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Browse by category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LIBRARY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => dispatch(openSectionLibrary({ insertPosition: null, targetZone: "body", category: category.id }))}
                className="rounded-full border border-apple-hairline px-3 py-1.5 text-[11px] font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
              >
                {category.emoji} {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
