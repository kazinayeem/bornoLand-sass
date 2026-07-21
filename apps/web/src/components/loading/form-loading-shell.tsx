"use client";

import type { ReactNode, FormHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

type FormLoadingShellProps = FormHTMLAttributes<HTMLFormElement> & {
  loading?: boolean;
  children: ReactNode;
  loadingLabel?: string;
};

/**
 * Wraps a form: disables all fields while submitting and sets aria-busy.
 */
export function FormLoadingShell({
  loading = false,
  children,
  loadingLabel = "Submitting form",
  className,
  ...props
}: FormLoadingShellProps) {
  return (
    <form
      {...props}
      aria-busy={loading || undefined}
      className={cn("relative", className)}
      onSubmit={(e) => {
        if (loading) {
          e.preventDefault();
          return;
        }
        props.onSubmit?.(e);
      }}
    >
      <fieldset disabled={loading} className={cn("min-w-0 border-0 p-0 m-0", loading && "opacity-90")}>
        {children}
      </fieldset>
      {loading && (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <LoadingSpinner size="xs" label={loadingLabel} />
          {loadingLabel}
        </div>
      )}
    </form>
  );
}
