"use client";

import { useMemo, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveTab, toggleLeftPanel } from "@/redux/slices/builder-slice";
import type { LeftTab } from "@/redux/slices/builder-slice";
import {
  Layers3, FileText, AppWindow, ImagePlus,
  Palette, ChevronLeft,
} from "lucide-react";
import { PagesPanel } from "./panels/pages-panel";
import { TemplatesPanel } from "./panels/templates-panel";
import { MediaPanel } from "./panels/media-panel";
import { LayersPanel } from "./layers-panel";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";
import { ThemePanel } from "./panels/theme-panel";

type TabDef = {
  key: LeftTab;
  icon: typeof Layers3;
  label: string;
  meta?: string;
};

export function BuilderSidebar() {
  const dispatch = useDispatch();
  const { storeSlug } = useRequiredStore();
  const activeTab = useSelector((s: RootState) => s.builder.activeTab);
  const sectionCount = useSelector((s: RootState) => s.builder.sections.length + s.builder.headerSections.length + s.builder.footerSections.length);

  const tabs: TabDef[] = useMemo(() => [
    { key: "layers", icon: Layers3, label: "Layers", meta: `${sectionCount}` },
    { key: "pages", icon: FileText, label: "Pages" },
    { key: "templates", icon: AppWindow, label: "Templates" },
    { key: "media", icon: ImagePlus, label: "Media" },
    { key: "theme", icon: Palette, label: "Theme" },
  ], [sectionCount]);

  const handleTabClick = useCallback((key: LeftTab) => {
    dispatch(setActiveTab(key));
  }, [dispatch]);

  const renderPanel = () => {
    switch (activeTab) {
      case "layers": return <LayersPanel />;
      case "pages": return <PagesPanel />;
      case "templates": return <TemplatesPanel />;
      case "media": return <MediaPanel billingHref={`/store/${storeSlug}/billing`} />;
      case "theme": return <ThemePanel />;
      default: return <LayersPanel />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Icon rail */}
      <div className="flex w-12 flex-col items-center gap-1 border-r border-zinc-200/60 bg-zinc-50/80 py-2">
        {tabs.map(({ key, icon: Icon, label, meta }) => (
          <button
            key={key}
            title={label}
            onClick={() => handleTabClick(key)}
            className={cn(
              "flex w-10 flex-col items-center justify-center rounded-xl px-1 py-1.5 text-[9px] font-medium transition-all",
              activeTab === key
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50"
                : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="mt-0.5 leading-none">{label}</span>
            {meta && <span className="text-[8px] text-zinc-400 leading-none mt-0.5">{meta}</span>}
          </button>
        ))}
        <button
          type="button"
          onClick={() => dispatch(toggleLeftPanel())}
          className="mt-auto flex w-10 flex-col items-center rounded-xl px-1 py-1.5 text-[9px] font-medium text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100/50 transition-all"
          title="Close sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="mt-0.5 leading-none">Close</span>
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden bg-white">
        {renderPanel()}
      </div>
    </div>
  );
}
