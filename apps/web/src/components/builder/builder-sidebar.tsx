"use client";

import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveTab, toggleLeftPanel, openSectionLibrary } from "@/redux/slices/builder-slice";
import type { LeftTab } from "@/redux/slices/builder-slice";
import {
  Plus,
  LayoutTemplate,
  ImagePlus,
  Palette,
  ListTree,
  History,
  PanelLeftClose,
} from "lucide-react";
import { TemplatesPanel } from "./panels/templates-panel";
import { MediaPanel } from "./panels/media-panel";
import { LayersPanel } from "./layers-panel";
import { ThemePanel } from "./panels/theme-panel";
import { HistoryPanel } from "./panels/history-panel";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";

type TabDef = {
  key: LeftTab;
  icon: typeof Plus;
  label: string;
  description: string;
};

const SIDEBAR_TABS: TabDef[] = [
  { key: "templates", icon: LayoutTemplate, label: "Layouts", description: "Start from a template" },
  { key: "media", icon: ImagePlus, label: "Images", description: "Your photos & files" },
  { key: "theme", icon: Palette, label: "Colors", description: "Brand & fonts" },
  { key: "navigator", icon: ListTree, label: "Sections", description: "Reorder page blocks" },
  { key: "history", icon: History, label: "History", description: "Undo timeline" },
];

export function BuilderSidebar() {
  const dispatch = useDispatch();
  const { storeSlug } = useRequiredStore();
  const activeTab = useSelector((s: RootState) => s.builder.activeTab);

  const handleTabClick = useCallback(
    (key: LeftTab) => {
      dispatch(setActiveTab(key));
    },
    [dispatch]
  );

  const renderPanel = () => {
    switch (activeTab) {
      case "templates":
        return <TemplatesPanel />;
      case "media":
        return <MediaPanel billingHref={`/store/${storeSlug}/billing`} />;
      case "theme":
        return <ThemePanel />;
      case "navigator":
        return <LayersPanel title="Sections" />;
      case "history":
        return <HistoryPanel />;
      default:
        return <TemplatesPanel />;
    }
  };

  const panelMeta = useMemo(() => {
    return SIDEBAR_TABS.find((tab) => tab.key === activeTab) ?? SIDEBAR_TABS[0];
  }, [activeTab]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-apple-canvas">
      <div className="border-b border-apple-hairline px-4 py-4">
        <button
          type="button"
          onClick={() => dispatch(openSectionLibrary({ insertPosition: null }))}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-apple-pill bg-apple-primary px-5 py-3 text-body text-apple-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add section
        </button>
        <p className="mt-4 text-caption text-apple-ink-muted-48">You&apos;re editing your store homepage.</p>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 w-[72px] flex-col items-stretch gap-1 border-r border-apple-hairline bg-apple-canvas-parchment/50 px-2 py-3">
          {SIDEBAR_TABS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              title={label}
              onClick={() => handleTabClick(key)}
              className={cn(
                "btn-press flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-apple-lg px-1 py-2 text-[10px] font-medium transition-colors",
                activeTab === key
                  ? "bg-apple-canvas text-apple-primary ring-1 ring-apple-hairline"
                  : "text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink-muted-80"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="max-w-full truncate leading-tight">{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => dispatch(toggleLeftPanel())}
            className="btn-press mt-auto flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-apple-lg px-1 py-2 text-[10px] font-medium text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas hover:text-apple-ink"
            title="Hide sidebar"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
            <span>Hide</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="border-b border-apple-hairline px-5 py-4">
            <h2 className="text-body-strong text-apple-ink">{panelMeta.label}</h2>
            <p className="mt-0.5 text-caption text-apple-ink-muted-48">{panelMeta.description}</p>
          </div>
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
