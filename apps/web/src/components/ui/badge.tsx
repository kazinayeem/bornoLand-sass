import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-[#F5F5F5] text-[#484848] border border-[#DFDFDF] dark:bg-[#27272a] dark:text-[#a1a1aa] dark:border-[#3f3f46]",
  primary: "bg-[#ebf0fa] text-[#003399] border border-[#b8cbed] dark:bg-[#003399]/20 dark:text-[#6694ff] dark:border-[#003399]/30 font-semibold",
  yellow: "bg-[#FFDA1A] text-[#111111] border border-[#e6c400] font-bold",
  outline: "border border-[#DFDFDF] bg-transparent text-[#111111] dark:border-[#27272a] dark:text-white",
  success: "bg-[#eaf6eb] text-[#0A8A00] border border-[#bce4be] dark:bg-[#0A8A00]/20 dark:text-[#52d248] dark:border-[#0A8A00]/30 font-medium",
  warning: "bg-[#fef4eb] text-[#E87400] border border-[#fbd6b1] dark:bg-[#E87400]/20 dark:text-[#ff9d3b] dark:border-[#E87400]/30 font-medium",
  danger: "bg-[#fcedee] text-[#CC0008] border border-[#f8bcc0] dark:bg-[#CC0008]/20 dark:text-[#ff666d] dark:border-[#CC0008]/30 font-medium",
  violet: "bg-[#ebf0fa] text-[#003399] border border-[#b8cbed]",
  slate: "bg-[#F5F5F5] text-[#484848] border border-[#DFDFDF]",
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
        "inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-xs transition-colors select-none",
        badgeVariants[variant],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
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
    shipped: { label: "Shipped", variant: "primary" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "danger" },
    refunded: { label: "Refunded", variant: "danger" },
    paid: { label: "Paid", variant: "success" },
    unpaid: { label: "Unpaid", variant: "warning" },
    partial: { label: "Partial", variant: "primary" },
    won: { label: "Won", variant: "success" },
    lost: { label: "Lost", variant: "danger" },
    true: { label: "Yes", variant: "success" },
    false: { label: "No", variant: "default" },
  };
  return map[status.toLowerCase()] ?? { label: status, variant: "default" };
};
