"use client";

import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveTab } from "@/redux/slices/builder-slice";
import { Layers3, Grid3X3, FileText, AppWindow, ImagePlus } from "lucide-react";
import { SectionPanel } from "./panels/section-panel";
import { PagesPanel } from "./panels/pages-panel";
import { TemplatesPanel } from "./panels/templates-panel";
import { MediaPanel } from "./panels/media-panel";
import { LayersPanel } from "./layers-panel";

export function BuilderSidebar({ storeId, storeSlug }: { storeId?: string; storeSlug?: string }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((s: RootState) => s.builder.activeTab);
  const sectionCount = useSelector((s: RootState) => s.builder.sections.length);
  const [railCollapsed, setRailCollapsed] = useState(false);

  const tabs = useMemo(() => [
    { key: "layers" as const, icon: Layers3, label: "Layers", meta: `${sectionCount}` },
    { key: "pages" as const, icon: FileText, label: "Pages" },
    { key: "components" as const, icon: Grid3X3, label: "Components" },
    { key: "templates" as const, icon: AppWindow, label: "Templates" },
    { key: "media" as const, icon: ImagePlus, label: "Media" },
  ], [sectionCount]);

  return (
    <div className="flex h-full">
      <div className="flex w-16 flex-col items-center gap-2 border-r border-zinc-200/70 bg-zinc-50/80 py-3">
        {tabs.map(({ key, icon: Icon, label, meta }) => (
          <button
            key={key}
            title={label}
            onClick={() => {
              dispatch(setActiveTab(key));
              setRailCollapsed(false);
            }}
            className={`flex w-12 flex-col items-center justify-center rounded-2xl px-1 py-2.5 text-[10px] font-medium transition-all ${
              activeTab === key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="mt-1">{label}</span>
            {meta ? <span className="text-[9px] text-zinc-400">{meta}</span> : null}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRailCollapsed((current) => !current)}
          className="mt-auto rounded-xl border border-zinc-200 bg-white px-2 py-1 text-[10px] font-medium text-zinc-500"
        >
          {railCollapsed ? "Open" : "Hide"}
        </button>
      </div>

      {!railCollapsed && (
        <div className="flex-1 overflow-y-auto bg-white">
          {activeTab === "layers" && <LayersPanel />}
          {activeTab === "components" && <SectionPanel />}
        {activeTab === "pages" && <PagesPanel storeId={storeId} storeSlug={storeSlug} />}
        {activeTab === "templates" && <TemplatesPanel />}
        {activeTab === "media" && <MediaPanel storeId={storeId} billingHref={storeSlug ? `/store/${storeSlug}/billing` : "#"} />}
        </div>
      )}
    </div>
  );
}
