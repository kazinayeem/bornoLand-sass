"use client";

import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  CreditCard,
  Truck,
  Bike,
  Tags,
  Ticket,
  Receipt,
  Wallet,
  Scale,
  Gauge,
  UserCog,
  RotateCcw,
  Undo2,
  Landmark,
  Crown,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_MODULES } from "./constants";
import type { ReportModuleId } from "./types";

const ICON_MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "trending-up": TrendingUp,
  "shopping-cart": ShoppingCart,
  package: Package,
  warehouse: Warehouse,
  users: Users,
  "credit-card": CreditCard,
  truck: Truck,
  bike: Bike,
  tags: Tags,
  ticket: Ticket,
  receipt: Receipt,
  wallet: Wallet,
  scale: Scale,
  gauge: Gauge,
  "user-cog": UserCog,
  "rotate-ccw": RotateCcw,
  "undo-2": Undo2,
  landmark: Landmark,
  crown: Crown,
  "sliders-horizontal": SlidersHorizontal,
};

export function ReportsModuleNav({
  active,
  onChange,
}: {
  active: ReportModuleId;
  onChange: (id: ReportModuleId) => void;
}) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-1 px-1">
        {REPORT_MODULES.map((mod) => {
          const Icon = ICON_MAP[mod.icon] ?? LayoutDashboard;
          const isActive = active === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              title={mod.description}
              onClick={() => onChange(mod.id)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] whitespace-nowrap transition-colors",
                isActive
                  ? "border-apple-ink bg-apple-ink text-white"
                  : "border-apple-hairline bg-white text-apple-ink-muted-80 hover:border-apple-ink/30 hover:text-apple-ink",
              )}
            >
              <Icon className="h-3 w-3 shrink-0" />
              {mod.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
