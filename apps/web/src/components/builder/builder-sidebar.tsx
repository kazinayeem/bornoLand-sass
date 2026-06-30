"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveTab } from "@/redux/slices/builder-slice";
import { Layout, Palette, Grid3X3, FileText } from "lucide-react";
import { SectionPanel } from "./panels/section-panel";
import { ThemePanel } from "./panels/theme-panel";
import { ProductsPanel } from "./panels/products-panel";

export function BuilderSidebar({ storeId }: { storeId?: string }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((s: RootState) => s.builder.activeTab);
  const sectionCount = useSelector((s: RootState) => s.builder.sections.length);

  const tabs = [
    { key: "sections" as const, icon: Layout, label: "Sections", meta: `${sectionCount}` },
    { key: "theme" as const, icon: Palette, label: "Theme" },
    { key: "products" as const, icon: Grid3X3, label: "Products" },
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
      </div>
    </div>
  );
}
