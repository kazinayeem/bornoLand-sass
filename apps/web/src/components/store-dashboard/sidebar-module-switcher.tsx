"use client";

import { useState } from "react";
import Link from "next/link";
import { BUSINESS_MODULES, type BusinessModule } from "./navigation-registry";
import { Compass } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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

  const activeModule =
    visibleModules.find((m) => m.id === activeModuleId) || visibleModules[0];

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 mx-auto transition-all shadow-2xs"
            title={isBn ? "বিজনেস মডিউল নির্বাচন করুন" : "Switch Business Module"}
          >
            <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={14}
          className="w-64 p-1.5 shadow-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl"
        >
          <div className="px-2 py-1 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {isBn ? "বিজনেস ডোমেইন" : "Business Modules"}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {visibleModules.map((m) => {
              const isActive = m.id === activeModuleId;
              return (
                <DropdownMenuItem key={m.id} asChild>
                  <Link
                    href={`${basePath}${m.defaultRoute}`}
                    onClick={() => onNavigate?.()}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    )}
                  >
                    <span className="text-sm">{m.badgeIcon}</span>
                    <span className="flex-1 truncate">{isBn ? m.titleBn : m.titleEn}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
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
