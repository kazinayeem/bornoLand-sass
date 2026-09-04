"use client";

import { useMemo } from "react";
import { Compass, Sparkles } from "lucide-react";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BUSINESS_MODULES, type BusinessModule } from "./navigation-registry";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const visibleModules = useMemo(() => {
    return BUSINESS_MODULES.filter(
      (m) => m.id === "home" || permittedModuleIds.has(m.id)
    );
  }, [permittedModuleIds]);

  // Dropdown items for collapsed mode
  const dropdownItems: DropdownItem[] = useMemo(() => {
    return visibleModules.map((m) => {
      const ModIcon = m.icon;
      return {
        key: m.id,
        label: isBn ? m.titleBn : m.titleEn,
        icon: ModIcon,
        onClick: () => {
          onSelectModule(m);
          onNavigate?.();
          window.location.href = `${basePath}${m.defaultRoute}`;
        },
      };
    });
  }, [visibleModules, isBn, basePath, onSelectModule, onNavigate]);

  if (collapsed) {
    return (
      <DropdownMenu
        trigger={
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50/80 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 mx-auto transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20"
            title={isBn ? "মডিউল পরিবর্তন করুন" : "Business Modules"}
            aria-label={isBn ? "মডিউল পরিবর্তন করুন" : "Business Modules"}
          >
            <Compass className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        }
        placement="right-start"
        items={dropdownItems}
        minWidth={220}
      />
    );
  }

  // Render modules excluding "home" if we want a clean 4-col grid of business domains
  const domainModules = visibleModules.filter((m) => m.id !== "home");

  return (
    <div className="px-2 py-2">
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {isBn ? "বিজনেস ডোমেইন" : "Business Modules"}
        </span>
        <span className="text-[10px] text-zinc-400 font-mono font-medium">
          {domainModules.length}
        </span>
      </div>

      {/* Modern Compact SaaS Module Tiles Grid */}
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-zinc-50/80 p-1 border border-zinc-200/60 dark:bg-zinc-900/40 dark:border-zinc-800/60">
        {domainModules.map((m) => {
          const isActive = m.id === activeModuleId;
          const ModIcon = m.icon;
          const title = isBn ? m.titleBn : m.titleEn;
          const shortTitle = isBn ? m.shortTitleBn : m.shortTitleEn;

          return (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelectModule(m)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-center transition-all duration-150 outline-none",
                    isActive
                      ? "bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/90 dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-white/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50"
                  )}
                  aria-label={title}
                  aria-pressed={isActive}
                >
                  <ModIcon
                    className={cn(
                      "h-3.5 w-3.5 mb-1 transition-colors shrink-0",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
                    )}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span className="text-[10px] leading-tight line-clamp-1 w-full truncate font-medium">
                    {shortTitle}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6} className="text-xs font-medium py-1 px-2.5">
                <p className="font-semibold">{title}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
