"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SettingsContentCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconWrapClassName?: string;
  published?: boolean;
  exists?: boolean;
  index?: number;
  className?: string;
  layout?: "grid" | "row";
};

export function SettingsContentCard({
  href,
  title,
  subtitle,
  icon: Icon,
  iconClassName = "h-5 w-5 text-blue-600",
  iconWrapClassName = "bg-blue-100",
  published,
  exists,
  index = 0,
  className,
  layout = "grid",
}: SettingsContentCardProps) {
  const router = useRouter();
  const disabled = !href || href === "#";

  const navigate = () => {
    if (disabled) {
      toast.error("Unable to open page", { description: "Store context is not ready yet. Try again in a moment." });
      return;
    }
    try {
      router.push(href);
    } catch {
      toast.error("Unable to open page");
    }
  };

  const cardClassName = cn(
    "group relative block w-full overflow-hidden rounded-apple-lg border border-apple-hairline bg-white p-5 text-left",
    "cursor-pointer transition-all duration-200 ease-out",
    "hover:-translate-y-0.5 hover:border-apple-primary/20 hover:shadow-md",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-primary/40 focus-visible:ring-offset-2",
    disabled && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none",
    className,
  );

  const inner = layout === "row" ? (
    <div className="flex items-center gap-4">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", iconWrapClassName)}>
        <Icon className={cn("h-6 w-6", iconClassName)} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-apple-ink">{title}</h3>
        {subtitle ? <p className="text-xs text-apple-ink-muted-48">{subtitle}</p> : null}
      </div>
      <ExternalLink className="h-5 w-5 shrink-0 text-apple-ink-muted-48 transition-colors group-hover:text-blue-500" />
    </div>
  ) : (
    <>
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconWrapClassName)}>
          <Icon className={iconClassName} />
        </div>
        <div className="flex items-center gap-1.5">
          {published !== undefined ? (
            published ? (
              <span className="sr-only">Published</span>
            ) : (
              <span className="sr-only">Draft</span>
            )
          ) : null}
          <ExternalLink className="h-3.5 w-3.5 text-apple-ink-muted-48 transition-colors group-hover:text-blue-500" />
        </div>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-apple-ink">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-apple-ink-muted-48">{subtitle}</p> : null}
      {(published !== undefined || exists !== undefined) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {published !== undefined && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                published ? "bg-emerald-50 text-emerald-700" : "bg-apple-canvas-parchment text-apple-ink-muted-48",
              )}
            >
              {published ? "Published" : "Draft"}
            </span>
          )}
          {exists === false && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">Auto-create</span>
          )}
        </div>
      )}
    </>
  );

  if (disabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        role="button"
        tabIndex={0}
        aria-disabled="true"
        className={cardClassName}
        onClick={navigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate();
          }
        }}
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link href={href} className={cardClassName} prefetch>
        {inner}
      </Link>
    </motion.div>
  );
}
