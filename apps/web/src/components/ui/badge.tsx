import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-muted text-muted-foreground ring-1 ring-border",
  primary: "bg-primary/10 text-primary ring-1 ring-primary/20",
  success: "bg-success/10 text-success ring-1 ring-success/20 dark:bg-success/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive ring-1 ring-destructive/20 dark:bg-destructive/20",
  violet: "bg-muted text-muted-foreground ring-1 ring-border",
  slate: "bg-secondary text-secondary-foreground ring-1 ring-border",
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
