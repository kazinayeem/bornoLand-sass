"use client";

import { useEffect, useRef, useCallback } from "react";
import { useIsBuilderMode } from "@/lib/builder-mode";
import { usePathname } from "next/navigation";
import { useTenant } from "@/providers/tenant-provider";

const STORAGE_VISITOR_KEY = "bn_visitor_id";
const STORAGE_SESSION_KEY = "bn_session_id";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type PageType = "homepage" | "product" | "category" | "cms_page" | "search" | "cart" | "checkout" | "order_success" | "not_found" | "landing" | "other";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_VISITOR_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(STORAGE_VISITOR_KEY, id);
  }
  return id;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(STORAGE_SESSION_KEY);
  if (!id) {
    id = generateId();
    sessionStorage.setItem(STORAGE_SESSION_KEY, id);
  }
  return id;
}

export function useAnalyticsTracker(pageType: PageType, opts?: {
  productId?: string;
  categoryId?: string;
  pageId?: string;
  searchQuery?: string;
  title?: string;
}) {
  const isBuilderMode = useIsBuilderMode();
  const tenant = useTenant();
  const storeId = tenant?.store?._id;
  const pathname = usePathname();
  const trackedPath = useRef<string>("");

  const track = useCallback(() => {
    if (isBuilderMode || !storeId || !API_BASE) return;
    const path = pathname || window.location.pathname;
    if (trackedPath.current === path) return;
    trackedPath.current = path;

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const url = window.location.href;
    const referrer = document.referrer || "";
    const userAgent = navigator.userAgent;
    const language = navigator.language;

    fetch(`${API_BASE}/analytics/track/${storeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        sessionId,
        pageType,
        url,
        path,
        title: opts?.title || document.title,
        productId: opts?.productId,
        categoryId: opts?.categoryId,
        pageId: opts?.pageId,
        searchQuery: opts?.searchQuery,
        referrer,
        userAgent,
        language,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [storeId, pathname, pageType, opts?.productId, opts?.categoryId, opts?.pageId, opts?.searchQuery, opts?.title]);

  useEffect(() => {
    track();
  }, [track]);

  useEffect(() => {
    const handleUnload = () => {
      if (!storeId || !API_BASE) return;
      const sessionId = getOrCreateSessionId();
      navigator.sendBeacon(
        `${API_BASE}/analytics/track/${storeId}/session-end`,
        JSON.stringify({ sessionId, exitPage: window.location.pathname, duration: 0 }),
      );
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [storeId]);
}

export function useTrackProductView(productId: string, productName: string) {
  useAnalyticsTracker("product", { productId, title: productName });
}

export function useTrackCategoryView(categoryId: string, categoryName: string) {
  useAnalyticsTracker("category", { categoryId, title: categoryName });
}

export function useTrackCmsPageView(pageId: string, pageTitle: string) {
  useAnalyticsTracker("cms_page", { pageId, title: pageTitle });
}
