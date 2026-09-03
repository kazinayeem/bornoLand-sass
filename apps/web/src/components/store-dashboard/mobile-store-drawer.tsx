"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { StoreBrandMark } from "./store-brand-mark";
import { BUSINESS_MODULES, type BusinessModule, type NavItem } from "./navigation-registry";
import { useLanguage } from "@/providers/language-provider";
import { useIsStoreOwner, usePermissions, checkPermission } from "@/features/session/hooks";
import { useGetStoreFeatureAccessQuery, NAV_FEATURE_MAP, getFeatureByKey } from "@/redux/api/feature-api";

interface MobileStoreDrawerProps {
  store: Store;
  onClose: () => void;
}

export function MobileStoreDrawer({ store, onClose }: MobileStoreDrawerProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const basePath = `/store/${store.slug}`;

  // Current selected module for drilldown (null = Level 1 modules list)
  const [selectedModule, setSelectedModule] = useState<BusinessModule | null>(null);

  const isOwner = useIsStoreOwner();
  const permissionSet = usePermissions();
  const { data: accessData } = useGetStoreFeatureAccessQuery(store._id, { skip: !store._id });
  const features = accessData?.data?.features ?? [];

  const resolveItemAccess = (item: NavItem) => {
    const key = item.featureKey ?? NAV_FEATURE_MAP[item.labelEn];
    const feature = key ? getFeatureByKey(features, key) : undefined;
    const hasPerm = isOwner || !item.permission || checkPermission(permissionSet, item.permission);
    return {
      locked: feature?.locked ?? false,
      noPermission: !hasPerm,
    };
  };

  // Filter modules
  const permittedModules = BUSINESS_MODULES.filter((m) => {
    if (m.id === "home") return true;
    return m.items.some((it) => !resolveItemAccess(it).noPermission);
  });

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <StoreBrandMark store={store} size={28} roundedClassName="rounded-md" />
          <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {store.shortName || store.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drilldown Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {selectedModule ? (
          /* Level 2: Inside a Specific Module */
          <div className="space-y-2 animate-in fade-in-50 slide-in-from-right-4 duration-150">
            <button
              type="button"
              onClick={() => setSelectedModule(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 py-1.5 px-1 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isBn ? "সকল মডিউলে ফিরুন" : "Back to Modules"}</span>
            </button>

            <div className="px-1 py-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <span className="text-base">{selectedModule.badgeIcon}</span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {isBn ? selectedModule.titleBn : selectedModule.titleEn}
              </h3>
            </div>

            <div className="space-y-1 pt-1">
              {selectedModule.items
                .filter((it) => !resolveItemAccess(it).noPermission)
                .map((item) => {
                  const href = `${basePath}${item.href}`;
                  const isActive = item.exact
                    ? pathname === href
                    : pathname.startsWith(href.split("?")[0]);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-900 font-bold border-l-2 border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-200"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      )}
                    >
                      <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                      <div className="flex-1 truncate">
                        <div className="truncate">{isBn ? item.labelBn : item.labelEn}</div>
                        {item.descriptionEn && (
                          <div className="text-[10px] text-zinc-400 truncate font-normal">
                            {isBn ? item.descriptionBn : item.descriptionEn}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        ) : (
          /* Level 1: Business Modules List */
          <div className="space-y-1 animate-in fade-in-50 duration-150">
            <div className="px-2 py-1 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {isBn ? "বিজনেস ডোমেইনসমূহ" : "Business Modules"}
              </span>
            </div>

            {permittedModules.map((mod) => {
              const ModIcon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    if (mod.id === "home") {
                      // Navigate directly to dashboard
                      onClose();
                      window.location.href = `${basePath}/dashboard`;
                    } else {
                      setSelectedModule(mod);
                    }
                  }}
                  className="flex w-full items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{mod.badgeIcon}</span>
                    <span className="truncate">{isBn ? mod.titleBn : mod.titleEn}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="border-t border-zinc-200/80 p-3 dark:border-zinc-800 shrink-0">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>{isBn ? "ওয়ার্কস্পেস ড্যাশবোর্ড" : "Back to Workspace"}</span>
        </Link>
      </div>
    </div>
  );
}
