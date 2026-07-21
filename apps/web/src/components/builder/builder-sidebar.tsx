"use client";

import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveTab, toggleLeftPanel, openSectionLibrary } from "@/redux/slices/builder-slice";
import type { LeftTab } from "@/redux/slices/builder-slice";
import {
  Layers3, FileText, AppWindow, ImagePlus, Blocks, Network,
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

  const sectionButton = (
    <button
      type="button"
      onClick={() => dispatch(openSectionLibrary({ insertPosition: null }))}
      className="mb-2 flex w-full items-center justify-between rounded-lg border border-apple-hairline bg-zinc-950 px-3 py-2.5 text-left text-white transition hover:bg-zinc-800"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <Blocks className="h-4 w-4" />
        Sections
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Add</span>
    </button>
  );

  const tabs: TabDef[] = useMemo(() => [
    { key: "layers", icon: Layers3, label: "Layers", meta: `${sectionCount}` },
    { key: "navigator", icon: Network, label: "Navigator" },
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
      case "navigator": return <LayersPanel title="Navigator" />;
      case "pages": return <PagesPanel />;
      case "templates": return <TemplatesPanel />;
      case "media": return <MediaPanel billingHref={`/store/${storeSlug}/billing`} />;
      case "theme": return <ThemePanel />;
      default: return <LayersPanel />;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-apple-hairline/60 bg-apple-canvas-parchment/80 p-3">
        {sectionButton}
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl border border-apple-hairline bg-apple-canvas px-3 py-2 text-left text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">
            Pages
            <div className="mt-0.5 text-[10px] font-normal text-apple-ink-muted-48">Manage routes</div>
          </button>
          <button className="rounded-xl border border-apple-hairline bg-apple-canvas px-3 py-2 text-left text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">
            History
            <div className="mt-0.5 text-[10px] font-normal text-apple-ink-muted-48">Undo / redo stack</div>
          </button>
        </div>
      </div>
      {/* Icon rail */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 w-14 flex-col items-center gap-1 border-r border-apple-hairline/60 bg-apple-canvas-parchment/80 py-2">
        {tabs.map(({ key, icon: Icon, label, meta }) => (
          <button
            key={key}
            title={label}
            onClick={() => handleTabClick(key)}
            className={cn(
              "flex w-11 flex-col items-center justify-center rounded-lg px-1 py-2 text-[9px] font-medium transition-all",
              activeTab === key
                ? "bg-apple-canvas text-apple-ink ring-1 ring-apple-hairline/50"
                : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80 hover:bg-apple-canvas-parchment/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="mt-0.5 leading-none">{label}</span>
            {meta && <span className="text-[8px] text-apple-ink-muted-48 leading-none mt-0.5">{meta}</span>}
          </button>
        ))}
        <button
          type="button"
          onClick={() => dispatch(toggleLeftPanel())}
          className="mt-auto flex w-11 flex-col items-center rounded-lg px-1 py-2 text-[9px] font-medium text-apple-ink-muted-48 hover:text-apple-ink-muted-80 hover:bg-apple-canvas-parchment/50 transition-all"
          title="Close sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="mt-0.5 leading-none">Close</span>
        </button>
        </div>

      {/* Panel content */}
      <div className="min-h-0 flex-1 overflow-hidden bg-apple-canvas">
        {renderPanel()}
      </div>
      </div>
    </div>
  );
}
