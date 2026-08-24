import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type StorePageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function StorePageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className,
  children,
}: StorePageHeaderProps) {
  return (
    <header className={cn("space-y-4 pb-2", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-apple-ink-muted-48">
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-apple-ink-muted-48/60" aria-hidden="true" />}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-apple-ink"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={cn(isLast ? "font-medium text-apple-ink" : "")}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-apple-ink sm:text-2xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-apple-ink-muted-48 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </header>
  );
}
