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

  const tabs = [
    { key: "sections" as const, icon: Layout, label: "Sections" },
    { key: "theme" as const, icon: Palette, label: "Theme" },
    { key: "products" as const, icon: Grid3X3, label: "Products" },
  ];

  return (
    <div className="flex h-full">
      <div className="flex w-12 flex-col items-center gap-1 border-r border-zinc-200 bg-zinc-50 py-2">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button key={key} title={label} onClick={() => dispatch(setActiveTab(key))}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              activeTab === key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            }`}>
            <Icon className="h-4 w-4" />
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
