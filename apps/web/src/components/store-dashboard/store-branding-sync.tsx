"use client";

import { useEffect } from "react";
import type { Store } from "@/redux/api/store-api";
import { getStoreFaviconUrl } from "@/lib/store-branding";

function upsertLink(rel: string, href: string) {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function StoreBrandingSync({ store }: { store: Pick<Store, "name" | "faviconUrl" | "logoUrl"> }) {
  useEffect(() => {
    const faviconUrl = getStoreFaviconUrl(store);
    if (!faviconUrl) return;
    upsertLink("icon", faviconUrl);
    upsertLink("shortcut icon", faviconUrl);
    upsertLink("apple-touch-icon", faviconUrl);
  }, [store]);

  return null;
}
