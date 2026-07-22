import type { ReactNode } from "react";
import { StorefrontShell, type StorefrontShellProps } from "@/components/storefront/storefront-shell";
import { cn } from "@/lib/utils";

type StoreLayoutProps = Omit<StorefrontShellProps, "children"> & {
  children: ReactNode;
  mainClassName?: string;
};

/**
 * Single shared storefront layout used by every tenant page.
 * Renders one Header (StoreNavbar), page content, and one Footer.
 */
export function StoreLayout({ children, mainClassName, ...shellProps }: StoreLayoutProps) {
  return (
    <StorefrontShell {...shellProps}>
      <main className={cn("min-w-0 overflow-x-clip", mainClassName)}>{children}</main>
    </StorefrontShell>
  );
}

export type { StorefrontShellProps };
