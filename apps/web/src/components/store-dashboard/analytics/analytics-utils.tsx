import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { dashboardClasses } from "@/components/store-dashboard/dashboard-ui";
import { cn } from "@/lib/utils";

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export const COLORS = ["#0066cc", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

export function AnalyticsLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-apple-primary" />
    </div>
  );
}

export function AnalyticsEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-apple-ink-muted-48">
      <Icon className="mb-3 h-12 w-12 opacity-50" />
      <p className="text-body-strong text-apple-ink">{title}</p>
      {description && <p className="text-caption">{description}</p>}
    </div>
  );
}

export function AnalyticsStatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(dashboardClasses.card, "p-apple-md")}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-apple-sm p-2", bg, color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-fine-print font-semibold uppercase tracking-wider text-apple-ink-muted-48">{label}</p>
          <p className="text-tagline text-apple-ink">{value}</p>
          {sub && <p className="text-fine-print text-apple-ink-muted-48">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export function AnalyticsChartCard({
  title,
  children,
  delay = 0,
  className = "",
}: {
  title: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(dashboardClasses.card, dashboardClasses.cardPad, className)}
    >
      <h3 className="mb-3 text-body-strong text-apple-ink">{title}</h3>
      {children}
    </motion.div>
  );
}

export function AnalyticsProgressBar({
  name,
  value,
  percentage,
  color = "bg-apple-primary",
}: {
  name: string;
  value: string | number;
  percentage: number;
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-caption">
        <span className="text-apple-ink-muted-80">{name}</span>
        <span className="text-apple-ink-muted-48">{percentage}%</span>
      </div>
      <div className={cn("mt-0.5", dashboardClasses.progressTrack)}>
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
