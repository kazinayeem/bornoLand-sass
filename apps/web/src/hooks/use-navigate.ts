"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/hooks/use-loading";

/**
 * Drop-in replacement for useRouter that shows navigation progress
 * on programmatic route changes (router.push / replace).
 */
export function useNavigate() {
  const router = useRouter();
  const { startNavigation } = useLoading();

  const push = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      startNavigation();
      router.push(href, options);
    },
    [router, startNavigation]
  );

  const replace = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      startNavigation();
      router.replace(href, options);
    },
    [router, startNavigation]
  );

  return { ...router, push, replace };
}
