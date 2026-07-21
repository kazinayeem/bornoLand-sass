"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useDismiss,
  useInteractions,
  FloatingArrow,
  FloatingPortal,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickEditMode = "text" | "image" | "button" | "video";

export type QuickEditAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export function rectFromDom(el: Element): QuickEditAnchor {
  const r = el.getBoundingClientRect();
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
  };
}

function useIsMobileSheet(breakpoint = 640) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpoint]);
  return mobile;
}

const MODE_LABEL: Record<QuickEditMode, string> = {
  text: "Text",
  image: "Image",
  button: "Button",
  video: "Video",
};

type ContextualQuickEditProps = {
  open: boolean;
  mode: QuickEditMode;
  anchor: QuickEditAnchor | null;
  /** Remount / animate when selection changes */
  selectionKey: string;
  children: ReactNode;
  onClose: () => void;
};

/**
 * Figma/Framer-style contextual editor: floats beside the selected element
 * with smart flip/shift, an arrow, and a mobile bottom sheet.
 */
export function ContextualQuickEdit({
  open,
  mode,
  anchor,
  selectionKey,
  children,
  onClose,
}: ContextualQuickEditProps) {
  const isMobile = useIsMobileSheet();
  const arrowRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const virtualRef = useMemo(() => {
    if (!anchor) return null;
    return {
      getBoundingClientRect: () => {
        const live = document.querySelector("[data-quick-edit-anchor='true']");
        if (live) {
          const r = live.getBoundingClientRect();
          return {
            width: Math.max(r.width, 1),
            height: Math.max(r.height, 1),
            x: r.x,
            y: r.y,
            top: r.top,
            left: r.left,
            right: r.right,
            bottom: r.bottom,
          };
        }
        return {
          width: Math.max(anchor.width, 1),
          height: Math.max(anchor.height, 1),
          x: anchor.x,
          y: anchor.y,
          top: anchor.top,
          left: anchor.left,
          right: anchor.right,
          bottom: anchor.bottom,
        };
      },
      contextElement: typeof document !== "undefined" ? document.body : undefined,
    };
  }, [anchor]);

  const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
    open: open && !isMobile && Boolean(anchor),
    onOpenChange: (next) => {
      if (!next) onClose();
    },
    placement: "right",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(14),
      flip({
        fallbackPlacements: ["left", "top", "bottom", "right-start", "left-start", "top-start", "bottom-start"],
        padding: 12,
      }),
      shift({ padding: 12 }),
      arrow({ element: arrowRef, padding: 10 }),
    ],
  });

  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: (event) => {
      const target = event.target as HTMLElement | null;
      // Nested Store Media picker must not dismiss this panel
      if (target?.closest("[data-media-picker-root]")) return false;
      return true;
    },
  });
  const { getFloatingProps } = useInteractions([dismiss]);

  useLayoutEffect(() => {
    if (virtualRef) refs.setReference(virtualRef);
  }, [refs, virtualRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[placement.split("-")[0] as "top" | "right" | "bottom" | "left"] ?? "left";

  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  // ── Mobile bottom sheet ─────────────────────────────────────
  if (isMobile) {
    return createPortal(
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="qe-backdrop"
              className="fixed inset-0 z-[90] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
            />
            <motion.div
              key={selectionKey}
              role="dialog"
              aria-label="Quick Edit"
              className="fixed inset-x-0 bottom-0 z-[91] max-h-[78vh] overflow-hidden rounded-t-2xl border border-apple-hairline bg-apple-canvas shadow-2xl"
              initial={{ y: "100%", opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex justify-center pt-2">
                <div className="h-1 w-10 rounded-full bg-apple-hairline" />
              </div>
              <PanelHeader mode={mode} onClose={onClose} />
              <div className="max-h-[calc(78vh-3.5rem)] overflow-y-auto px-4 pb-6 pt-1">
                {children}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>,
      document.body,
    );
  }

  // ── Desktop / tablet floating panel ─────────────────────────
  return (
    <FloatingPortal>
      <AnimatePresence mode="wait">
        {open && anchor ? (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[90]"
          >
            <motion.div
              key={selectionKey}
              role="dialog"
              aria-label="Quick Edit"
              initial={{ opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-apple-hairline",
                "bg-apple-canvas/95 p-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)] backdrop-blur-xl",
              )}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <FloatingArrow
                ref={arrowRef}
                context={context}
                width={12}
                height={7}
                className="fill-apple-canvas [&>path:first-of-type]:stroke-apple-hairline"
                style={{
                  left: arrowX != null ? `${arrowX}px` : undefined,
                  top: arrowY != null ? `${arrowY}px` : undefined,
                  [staticSide]: "-7px",
                }}
              />
              <PanelHeader mode={mode} onClose={onClose} />
              <div className="mt-3 space-y-3">{children}</div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </FloatingPortal>
  );
}

function PanelHeader({ mode, onClose }: { mode: QuickEditMode; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Quick Edit</p>
        <p className="truncate text-[13px] font-semibold text-apple-ink">{MODE_LABEL[mode]}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
        aria-label="Close quick edit"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
