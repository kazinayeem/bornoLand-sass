"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { isInternalHref, resolveStoreHref } from "@/lib/store-href";

type StoreLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
};

export function StoreLink({ href, children, ...props }: StoreLinkProps) {
  const pathname = usePathname() || "";

  if (!href || href === "#") {
    return <span {...(props as object)}>{children}</span>;
  }

  const resolvedHref = isInternalHref(href) ? resolveStoreHref(href, pathname) : href;

  if (isInternalHref(resolvedHref)) {
    return (
      <Link href={resolvedHref} prefetch {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={resolvedHref} {...(props as object)}>
      {children}
    </a>
  );
}

export { resolveStoreHref, useProductHref, useStoreHref } from "@/lib/store-href";
