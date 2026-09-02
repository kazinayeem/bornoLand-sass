"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { DocumentPageSize } from "./document-types";

interface PrintPortalProps {
  children: ReactNode;
  pageSize?: DocumentPageSize;
  active?: boolean;
}

export function PrintPortal({
  children,
  pageSize = "a4-portrait",
  active = true,
}: PrintPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    let el = document.getElementById("bornoland-print-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "bornoland-print-root";
      document.body.appendChild(el);
    }
    setContainer(el);

    if (active) {
      document.body.classList.add("has-printable-document");
      document.body.classList.add(`print-size-${pageSize}`);
    }

    return () => {
      document.body.classList.remove("has-printable-document");
      document.body.classList.remove(`print-size-${pageSize}`);
    };
  }, [active, pageSize]);

  useEffect(() => {
    if (!active) return;
    // Clean up previous print size classes
    const sizes: DocumentPageSize[] = ["a4-portrait", "a4-landscape", "thermal-80", "thermal-58"];
    sizes.forEach((s) => document.body.classList.remove(`print-size-${s}`));
    document.body.classList.add(`print-size-${pageSize}`);
  }, [pageSize, active]);

  if (!mounted || !container || !active) {
    return null;
  }

  return createPortal(children, container);
}
