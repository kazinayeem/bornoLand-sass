"use client";

import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveTab, toggleLeftPanel } from "@/redux/slices/builder-slice";
import type { LeftTab } from "@/redux/slices/builder-slice";
import {
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
  icon: typeof LayoutTemplate;
  label: string;
};

const SIDEBAR_TABS: TabDef[] = [
  { key: "templates", icon: LayoutTemplate, label: "Layouts" },
  { key: "media", icon: ImagePlus, label: "Images" },
  { key: "theme", icon: Palette, label: "Colors" },
  { key: "navigator", icon: ListTree, label: "Sections" },
  { key: "history", icon: History, label: "History" },
];

export function BuilderSidebar() {
  const dispatch = useDispatch();
  const { storeSlug } = useRequiredStore();
  const activeTab = useSelector((s: RootState) => s.builder.activeTab);

  const handleTabClick = useCallback(
    (key: LeftTab) => {
      dispatch(setActiveTab(key));
    },
    [dispatch],
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
        return <LayersPanel title="Sections" />;
    }
  };

  const panelMeta = useMemo(() => {
    return SIDEBAR_TABS.find((tab) => tab.key === activeTab) ?? SIDEBAR_TABS[0];
  }, [activeTab]);

  const showPanelHeading = activeTab === "media" || activeTab === "theme";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-apple-canvas">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 w-[64px] flex-col items-stretch gap-0.5 border-r border-apple-hairline bg-apple-canvas-parchment/50 px-1.5 py-2">
          {SIDEBAR_TABS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              title={label}
              onClick={() => handleTabClick(key)}
              className={cn(
                "btn-press flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-apple-md px-1 py-1.5 text-[10px] font-medium transition-colors",
                activeTab === key
                  ? "bg-apple-canvas text-apple-primary ring-1 ring-apple-hairline"
                  : "text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink-muted-80",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate leading-tight">{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => dispatch(toggleLeftPanel())}
            className="btn-press mt-auto flex min-h-[40px] flex-col items-center justify-center gap-0.5 rounded-apple-md px-1 py-1.5 text-[10px] font-medium text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas hover:text-apple-ink"
            title="Hide sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
            <span>Hide</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {showPanelHeading ? (
            <div className="border-b border-apple-hairline px-3 py-3">
              <h2 className="text-[13px] font-semibold text-apple-ink">{panelMeta.label}</h2>
            </div>
          ) : null}
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
