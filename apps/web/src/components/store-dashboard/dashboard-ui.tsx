"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

/** DESIGN.md surface tokens for store dashboard (CMS) pages. */
export const dashboardClasses = {
  page: "space-y-6",
  heading: "text-display-md text-apple-ink",
  subheading: "text-body text-apple-ink-muted-48",
  card: "rounded-apple-lg border border-apple-hairline bg-apple-canvas",
  cardPad: "p-apple-lg sm:p-apple-xl",
  cardHover: "transition-colors duration-200 hover:border-apple-primary/30",
  input:
    "h-11 rounded-apple-pill border border-apple-hairline bg-apple-canvas px-4 text-body text-apple-ink outline-none focus:ring-2 focus:ring-apple-primary-focus",
  select:
    "h-11 rounded-apple-pill border border-apple-hairline bg-apple-canvas px-4 pr-8 text-body text-apple-ink-muted-80 outline-none focus:ring-2 focus:ring-apple-primary-focus",
  table: "w-full text-caption",
  tableHead: "border-b border-apple-hairline bg-apple-canvas-parchment text-caption-strong text-apple-ink-muted-80",
  tableRow: "border-b border-apple-divider-soft transition-colors hover:bg-apple-canvas-parchment/60",
  divider: "border-apple-hairline",
  muted: "text-apple-ink-muted-48",
  body: "text-apple-ink-muted-80",
  progressTrack: "h-1.5 overflow-hidden rounded-full bg-apple-canvas-parchment",
};

export function DashboardPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className={dashboardClasses.heading}>{title}</h1>
        {description ? <p className={cn("mt-1", dashboardClasses.subheading)}>{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function DashboardCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(dashboardClasses.card, dashboardClasses.cardPad, hover && dashboardClasses.cardHover, className)}>
      {children}
    </div>
  );
}

export function DashboardButton({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "utility" }) {
  const base = "btn-press inline-flex items-center justify-center gap-2 font-body transition-opacity disabled:cursor-not-allowed disabled:opacity-50";

  if (variant === "secondary") {
    return (
      <button
        type="button"
        className={cn(
          base,
          "rounded-apple-pill border border-apple-primary bg-transparent px-[22px] py-[11px] text-body text-apple-primary",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === "utility") {
    return (
      <button
        type="button"
        className={cn(
          base,
          "rounded-apple-sm bg-apple-ink px-[15px] py-2 text-caption text-apple-on-dark",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        base,
        "rounded-apple-pill bg-apple-primary px-[22px] py-[11px] text-body text-apple-on-primary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DashboardButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "utility";
  className?: string;
  children: ReactNode;
}) {
  const base = "btn-press inline-flex items-center justify-center gap-2 font-body transition-opacity";

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "rounded-apple-pill border border-apple-primary bg-transparent px-[22px] py-[11px] text-body text-apple-primary",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  if (variant === "utility") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "rounded-apple-sm bg-apple-ink px-[15px] py-2 text-caption text-apple-on-dark",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        base,
        "rounded-apple-pill bg-apple-primary px-[22px] py-[11px] text-body text-apple-on-primary",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-3 text-apple-ink-muted-48/50">{icon}</div>
      <p className="text-body-strong text-apple-ink">{title}</p>
      {description ? <p className="mt-1 text-caption text-apple-ink-muted-48">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
