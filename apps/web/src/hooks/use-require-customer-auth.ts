"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { buildLoginUrl } from "@/lib/auth-redirect";
import { resolveStoreHref } from "@/lib/store-href";
import { useIsClient } from "@/hooks/use-is-client";

/**
 * Protects a storefront page: wait for auth restore, then redirect guests to login once.
 * Returns loading/ready flags so the page can show a loader instead of flashing content.
 *
 * Auth is client-only (localStorage + singleton Redux). Always treat the first
 * server/client paint as "loading" so SSR HTML matches hydration when the
 * browser store is already restored from a prior soft navigation.
 */
export function useRequireCustomerAuth(returnPath: string) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { restored, isAuthenticated } = useSelector((s: RootState) => s.customer);
  const redirectedRef = useRef(false);
  const mounted = useIsClient();

  useEffect(() => {
    if (!mounted || !restored || isAuthenticated || redirectedRef.current) return;
    redirectedRef.current = true;
    const loginUrl = buildLoginUrl(returnPath, "/account/login");
    router.replace(resolveStoreHref(loginUrl, pathname));
  }, [mounted, restored, isAuthenticated, returnPath, router, pathname]);

  const ready = mounted && restored && isAuthenticated;

  return {
    /** Auth state finished hydrating from localStorage */
    restored: mounted && restored,
    /** Customer is logged in */
    isAuthenticated,
    /** Safe to render protected UI */
    ready,
    /** Show full-page loader (hydrating, restoring, or bouncing to login) */
    showLoader: !ready,
  };
}
