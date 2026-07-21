"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { buildLoginUrl } from "@/lib/auth-redirect";
import { resolveStoreHref } from "@/lib/store-href";

/**
 * Protects a storefront page: wait for auth restore, then redirect guests to login once.
 * Returns loading/ready flags so the page can show a loader instead of flashing content.
 */
export function useRequireCustomerAuth(returnPath: string) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { restored, isAuthenticated } = useSelector((s: RootState) => s.customer);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!restored || isAuthenticated || redirectedRef.current) return;
    redirectedRef.current = true;
    const loginUrl = buildLoginUrl(returnPath, "/account/login");
    router.replace(resolveStoreHref(loginUrl, pathname));
  }, [restored, isAuthenticated, returnPath, router, pathname]);

  return {
    /** Auth state finished hydrating from localStorage */
    restored,
    /** Customer is logged in */
    isAuthenticated,
    /** Safe to render protected UI */
    ready: restored && isAuthenticated,
    /** Show full-page loader (restoring or bouncing to login) */
    showLoader: !restored || !isAuthenticated,
  };
}
