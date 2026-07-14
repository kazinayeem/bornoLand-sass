"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

type StoreLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
};

export function StoreLink({ href, children, ...props }: StoreLinkProps) {
  const pathname = usePathname() || "";

  if (!href || href === "#") {
    return <span {...props as any}>{children}</span>;
  }

  let resolvedHref = href;
  if (isInternalHref(href)) {
    if (pathname.startsWith("/store/")) {
      const parts = pathname.split("/");
      const storeSlug = parts[2];
      const prefix = `/store/${storeSlug}`;
      if (!href.startsWith(prefix)) {
        resolvedHref = href === "/" ? prefix : `${prefix}${href}`;
      }
    }
  }

  if (isInternalHref(resolvedHref)) {
    return (
      <Link href={resolvedHref} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={resolvedHref} {...props as any}>
      {children}
    </a>
  );
}
