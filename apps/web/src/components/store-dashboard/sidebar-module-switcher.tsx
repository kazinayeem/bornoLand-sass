"use client";

import { BUSINESS_MODULES, type BusinessModule } from "./navigation-registry";
import { Compass } from "lucide-react";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SidebarModuleSwitcherProps {
  basePath: string;
  activeModuleId: string;
  onSelectModule: (module: BusinessModule) => void;
  collapsed: boolean;
  isBn: boolean;
  permittedModuleIds: Set<string>;
  onNavigate?: () => void;
}

export function SidebarModuleSwitcher({
  basePath,
  activeModuleId,
  onSelectModule,
  collapsed,
  isBn,
  permittedModuleIds,
  onNavigate,
}: SidebarModuleSwitcherProps) {
  // Filter modules that have at least one permitted item (except Home which is always available)
  const visibleModules = BUSINESS_MODULES.filter(
    (m) => m.id === "home" || permittedModuleIds.has(m.id)
  );

  const dropdownItems: DropdownItem[] = visibleModules.map((m) => ({
    key: m.id,
    label: `${m.badgeIcon} ${isBn ? m.titleBn : m.titleEn}`,
    icon: m.icon,
    onClick: () => {
      onNavigate?.();
      window.location.href = `${basePath}${m.defaultRoute}`;
    },
  }));

  if (collapsed) {
    return (
      <DropdownMenu
        trigger={
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 mx-auto transition-all shadow-2xs"
            title={isBn ? "বিজনেস মডিউল নির্বাচন করুন" : "Switch Business Module"}
          >
            <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </button>
        }
        placement="right-start"
        items={dropdownItems}
        minWidth={220}
      />
    );
  }

  return (
    <div className="px-1 py-1">
      <div className="flex items-center justify-between px-2 mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {isBn ? "বিজনেস মডিউলসমূহ" : "Business Modules"}
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">
          {visibleModules.length}
        </span>
      </div>

      {/* Horizontal Compact Module Pills Strip */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100/70 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80">
        {visibleModules.slice(1, 9).map((m) => {
          const isActive = m.id === activeModuleId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectModule(m)}
              title={isBn ? m.titleBn : m.titleEn}
              className={cn(
                "flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-all",
                isActive
                  ? "bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-bold dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <span className="text-xs mb-0.5">{m.badgeIcon}</span>
              <span className="truncate max-w-[48px] leading-tight">
                {isBn ? m.shortTitleBn : m.shortTitleEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
