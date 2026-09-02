"use client";

import { useMemo } from "react";
import {
  Package,
  History,
  ArrowLeftRight,
  Warehouse,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingDown,
  Layers,
  FileBarChart,
  BarChart2,
  Bell,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type InventoryNavSection =
  | "stock"
  | "history"
  | "transfers"
  | "warehouses"
  | "purchase_orders"
  | "suppliers"
  | "price_history"
  | "cost_history"
  | "batches"
  | "reports"
  | "analytics"
  | "alerts"
  | "audit"
  | "barcode";

export type InventoryNavItem = {
  id: InventoryNavSection;
  label: string;
  group: "primary" | "operations" | "analysis" | "control";
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  locked?: boolean;
};

const NAV_ITEMS: InventoryNavItem[] = [
  // Primary
  { id: "stock", label: "Current Stock", group: "primary", icon: Package },

  // Operations
  { id: "history", label: "Stock History", group: "operations", icon: History },
  { id: "transfers", label: "Stock Transfers", group: "operations", icon: ArrowLeftRight },
  { id: "warehouses", label: "Warehouses", group: "operations", icon: Warehouse },
  { id: "purchase_orders", label: "Purchase Orders", group: "operations", icon: ShoppingBag },
  { id: "suppliers", label: "Suppliers", group: "operations", icon: Users },

  // Analysis
  { id: "price_history", label: "Price History", group: "analysis", icon: DollarSign },
  { id: "cost_history", label: "Cost History", group: "analysis", icon: TrendingDown },
  { id: "batches", label: "Batch / FIFO", group: "analysis", icon: Layers },
  { id: "reports", label: "Reports", group: "analysis", icon: FileBarChart },
  { id: "analytics", label: "Analytics", group: "analysis", icon: BarChart2 },

  // Control
  { id: "alerts", label: "Low Stock Alerts", group: "control", icon: Bell },
  { id: "audit", label: "Audit Log", group: "control", icon: ShieldCheck },
];

type InventoryNavProps = {
  activeSection: InventoryNavSection;
  onSelectSection: (section: InventoryNavSection) => void;
  lockedModules?: Partial<Record<InventoryNavSection, boolean>>;
};

export function InventoryNav({
  activeSection,
  onSelectSection,
  lockedModules = {},
}: InventoryNavProps) {
  const groups = useMemo(
    () => [
      { key: "primary", label: "Overview", items: NAV_ITEMS.filter((i) => i.group === "primary") },
      { key: "operations", label: "Operations", items: NAV_ITEMS.filter((i) => i.group === "operations") },
      { key: "analysis", label: "Analysis & Valuation", items: NAV_ITEMS.filter((i) => i.group === "analysis") },
      { key: "control", label: "Control & Logs", items: NAV_ITEMS.filter((i) => i.group === "control") },
    ],
    []
  );

  return (
    <div className="border-b border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Desktop Horizontal Segmented Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto px-1 py-1.5 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isLocked = Boolean(lockedModules[item.id]);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={cn(
                "group relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                isActive
                  ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isActive
                    ? "text-white dark:text-zinc-900"
                    : "text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                )}
              />
              <span>{item.label}</span>
              {isLocked && (
                <Lock className="h-3 w-3 text-amber-500" />
              )}
              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    isActive
                      ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
