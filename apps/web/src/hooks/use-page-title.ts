"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

function toTitleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function usePageTitle() {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (!segments.length) return "Dashboard";
    return toTitleCase(segments[segments.length - 1]);
  }, [pathname]);
}
