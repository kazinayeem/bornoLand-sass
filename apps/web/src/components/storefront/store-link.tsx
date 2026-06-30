"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

type StoreLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
};

export function StoreLink({ href, children, ...props }: StoreLinkProps) {
  if (!href || href === "#") {
    return <span {...props}>{children}</span>;
  }

  if (isInternalHref(href)) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
