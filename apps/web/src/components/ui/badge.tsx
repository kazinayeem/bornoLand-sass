import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-apple-canvas-parchment text-apple-ink-muted-80 ring-1 ring-apple-hairline",
  primary: "bg-apple-primary/10 text-apple-primary ring-1 ring-apple-primary/20",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200/70 dark:bg-red-950/30 dark:text-red-400",
  violet: "bg-apple-canvas-parchment text-apple-ink-muted-80 ring-1 ring-apple-hairline",
  slate: "bg-apple-surface-pearl text-apple-ink-muted-80 ring-1 ring-apple-hairline",
};

type BadgeProps = {
  variant?: keyof typeof badgeVariants;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
};

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-fine-print font-normal",
        badgeVariants[variant],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}

export const statusBadge = (
  status: string
): { label: string; variant: keyof typeof badgeVariants } => {
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
