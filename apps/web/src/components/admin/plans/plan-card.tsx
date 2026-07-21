"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Archive,
  Copy,
  Edit,
  Eye,
  HardDrive,
  Package,
  ShoppingBag,
  Star,
  Users,
  Wifi,
  DollarSign,
  Layers,
} from "lucide-react";
import type { Plan } from "@/redux/api/store-api";
import type { PlanStats } from "@/lib/plan-stats";
import { formatCurrency } from "@/lib/format-currency";
import { Badge } from "@/components/ui/badge";

function formatLimit(value: number, unit = "") {
  if (value === 0) return "Unlimited";
  return `${value}${unit}`;
}

function formatStorage(gb?: number, storageMB?: number) {
  if (storageMB) {
    return storageMB >= 1024 ? `${(storageMB / 1024).toFixed(1)} GB` : `${storageMB} MB`;
  }
  if (!gb || gb === 0) return "—";
  if (gb < 1) return `${Math.round(gb * 1024)} MB`;
  return `${gb} GB`;
}

export function PlanCard({
  plan,
  featureCount,
  storageMB,
  stats,
  index,
  onDuplicate,
  onArchive,
}: {
  plan: Plan;
  featureCount?: number;
  storageMB?: number;
  stats?: PlanStats;
  index?: number;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  const yearly = plan.priceYearly ?? plan.pricing?.yearly ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.04 }}
      className={`group relative flex flex-col overflow-hidden rounded-lg border bg-apple-canvas transition-colors ${
        plan.isRecommended
          ? "border-blue-200 ring-1 ring-blue-400/40"
          : plan.isActive
            ? "border-apple-hairline"
            : "border-apple-divider-soft opacity-75"
      }`}
    >
      {plan.isRecommended && (
        <div className="absolute inset-x-0 top-0 h-1 bg-apple-primary" />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-bold text-apple-ink">{plan.name}</h3>
              {plan.isRecommended && (
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  <Star className="mr-1 h-3 w-3" />
                  Recommended
                </Badge>
              )}
            </div>
            <p className="text-xs text-apple-ink-muted-48">/{plan.slug}</p>
            {plan.description && (
              <p className="mt-2 line-clamp-2 text-sm text-apple-ink-muted-48">{plan.description}</p>
            )}
          </div>
          <Badge variant={plan.isActive ? "success" : "warning"}>{plan.isActive ? "Active" : "Archived"}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-apple-canvas-parchment p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-apple-ink-muted-48">Monthly</p>
            <p className="mt-1 text-xl font-bold text-apple-ink">
              {formatCurrency(plan.priceBDT, { currencySymbol: "৳", currencyPosition: "before", decimalPlaces: 0 })}
            </p>
          </div>
          <div className="rounded-xl bg-apple-canvas-parchment p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-apple-ink-muted-48">Yearly</p>
            <p className="mt-1 text-xl font-bold text-apple-ink">
              {yearly > 0
                ? formatCurrency(yearly, { currencySymbol: "৳", currencyPosition: "before", decimalPlaces: 0 })
                : "—"}
            </p>
          </div>
        </div>

        {plan.trialDays > 0 && (
          <p className="mt-2 text-xs font-medium text-emerald-600">{plan.trialDays}-day trial</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <Metric icon={HardDrive} label="Storage" value={formatStorage(plan.limits.storage, storageMB)} />
          <Metric icon={Package} label="Products" value={formatLimit(plan.limits.products)} />
          <Metric icon={ShoppingBag} label="Orders" value={formatLimit(plan.limits.orders)} />
          <Metric icon={Users} label="Staff" value={formatLimit(plan.limits.staff)} />
          <Metric icon={Star} label="Features" value={featureCount != null ? String(featureCount) : "—"} />
          <Metric icon={Star} label="Features" value={featureCount != null ? String(featureCount) : "—"} />
        </div>

        {stats && (
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4">
            <Metric icon={Layers} label="Subscribers" value={String(stats.subscribers)} />
            <Metric
              icon={DollarSign}
              label="Revenue"
              value={formatCurrency(stats.revenueBDT, { currencySymbol: "৳", currencyPosition: "before", decimalPlaces: 0 })}
            />
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
          <Link
            href={`/admin/dashboard/plans/${plan._id}?tab=preview`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
          <Link
            href={`/admin/dashboard/plans/${plan._id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDuplicate(plan._id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onArchive(plan._id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-red-50 hover:text-red-600"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-100 px-2.5 py-2">
      <Icon className="h-3.5 w-3.5 text-apple-ink-muted-48" />
      <div className="min-w-0">
        <p className="text-[10px] text-apple-ink-muted-48">{label}</p>
        <p className="truncate font-semibold text-zinc-800">{value}</p>
      </div>
    </div>
  );
}
