import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200",
  primary: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  slate: "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
};

type BadgeProps = {
  variant?: keyof typeof badgeVariants;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
};

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-medium", badgeVariants[variant], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}

export const statusBadge = (status: string): { label: string; variant: keyof typeof badgeVariants } => {
  const map: Record<string, { label: string; variant: keyof typeof badgeVariants }> = {
    active: { label: "Active", variant: "success" },
    inactive: { label: "Inactive", variant: "default" },
    draft: { label: "Draft", variant: "default" },
    published: { label: "Published", variant: "success" },
    pending: { label: "Pending", variant: "warning" },
    processing: { label: "Processing", variant: "primary" },
    shipped: { label: "Shipped", variant: "violet" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "danger" },
    refunded: { label: "Refunded", variant: "danger" },
    paid: { label: "Paid", variant: "success" },
    unpaid: { label: "Unpaid", variant: "warning" },
    partial: { label: "Partial", variant: "primary" },
    true: { label: "Yes", variant: "success" },
    false: { label: "No", variant: "default" },
  };
  return map[status.toLowerCase()] ?? { label: status, variant: "default" };
};
