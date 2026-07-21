import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full rounded-lg border border-apple-hairline bg-apple-canvas p-8 dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2 sm:p-9">
      <div className="mb-8 space-y-3">
        <p className="text-caption-strong uppercase tracking-[0.32em] text-apple-primary">BornoLand</p>
        <h1 className="text-display-md text-apple-ink dark:text-apple-body-on-dark">{title}</h1>
        <p className="text-caption text-apple-ink-muted-48 dark:text-apple-body-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
