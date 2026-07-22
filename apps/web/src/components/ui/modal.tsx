"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  showClose?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  footer?: React.ReactNode;
  loading?: boolean;
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-5xl",
  full: "max-w-6xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
  showClose = true,
  stickyHeader,
  stickyFooter,
  footer,
  loading = false,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, loading]);

  const hasHeader = title || description;

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto p-4 pt-8 sm:pt-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-apple-surface-black/60 backdrop-blur-sm"
            onClick={() => !loading && onClose()}
          />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              "relative flex max-h-[90vh] w-full flex-col rounded-lg border border-border bg-card",
              sizeClasses[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-busy={loading || undefined}
          >
            {(hasHeader || showClose) && (
              <div
                className={cn(
                  "flex items-start justify-between gap-4 p-apple-lg pb-4",
                  stickyHeader &&
                    "sticky top-0 z-10 rounded-t-lg border-b border-border bg-card"
                )}
              >
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 className="text-body-strong text-card-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-caption text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="btn-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-border disabled:opacity-40"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-apple-lg pb-apple-lg">{children}</div>

            {footer && (
              <div
                className={cn(
                  "px-apple-lg py-4",
                  stickyFooter &&
                    "sticky bottom-0 rounded-b-lg border-t border-border bg-card"
                )}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
