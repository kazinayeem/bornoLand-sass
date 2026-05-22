import { cn } from "@/lib/utils";

const statusConfig: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  active: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
  invited: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", label: "Invited" },
  suspended: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", label: "Suspended" },
  banned: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", label: "Banned" },
  trialing: { dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700", label: "Trialing" },
  past_due: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", label: "Past Due" },
  open: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", label: "Open" },
  in_progress: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", label: "In Progress" },
  resolved: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", label: "Resolved" },
  high: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", label: "High" },
  medium: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", label: "Medium" },
  low: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", label: "Low" },
  default: { dot: "bg-zinc-400", bg: "bg-zinc-100", text: "text-zinc-600", label: "Unknown" }
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] ?? statusConfig.default;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", config.bg, config.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
