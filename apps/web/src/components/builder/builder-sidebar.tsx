"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveTab } from "@/redux/slices/builder-slice";
import { Layout, Palette, Grid3X3, FileText, AppWindow, ImagePlus } from "lucide-react";
import { SectionPanel } from "./panels/section-panel";
import { ThemePanel } from "./panels/theme-panel";
import { ProductsPanel } from "./panels/products-panel";
import { PagesPanel } from "./panels/pages-panel";
import { TemplatesPanel } from "./panels/templates-panel";
import { MediaPanel } from "./panels/media-panel";

export function BuilderSidebar({ storeId, storeSlug }: { storeId?: string; storeSlug?: string }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((s: RootState) => s.builder.activeTab);
  const sectionCount = useSelector((s: RootState) => s.builder.sections.length);

  const tabs = [
    { key: "sections" as const, icon: Layout, label: "Sections", meta: `${sectionCount}` },
    { key: "pages" as const, icon: FileText, label: "Pages" },
    { key: "products" as const, icon: Grid3X3, label: "Components" },
    { key: "theme" as const, icon: Palette, label: "Style" },
    { key: "templates" as const, icon: AppWindow, label: "Templates" },
    { key: "media" as const, icon: ImagePlus, label: "Media" },
  ];

  return (
    <div className="flex h-full">
      <div className="flex w-16 flex-col items-center gap-2 border-r border-zinc-200 bg-zinc-50/70 py-3">
        {tabs.map(({ key, icon: Icon, label, meta }) => (
          <button key={key} title={label} onClick={() => dispatch(setActiveTab(key))}
            className={`flex w-12 flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-medium transition-colors ${
              activeTab === key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            }`}>
            <Icon className="h-4 w-4" />
            <span className="mt-1">{label}</span>
            {meta ? <span className="text-[9px] text-zinc-400">{meta}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === "sections" && <SectionPanel />}
        {activeTab === "theme" && <ThemePanel />}
        {activeTab === "products" && <ProductsPanel storeId={storeId} />}
        {activeTab === "pages" && <PagesPanel storeId={storeId} />}
        {activeTab === "templates" && <TemplatesPanel />}
        {activeTab === "media" && <MediaPanel storeId={storeId} billingHref={storeSlug ? `/store/${storeSlug}/billing` : "#"} />}
      </div>
    </div>
  );
}
