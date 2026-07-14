"use client";

import { useEffect, useRef } from "react";
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
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-5xl",
  full: "max-w-6xl",
};

export function Modal({ open, onClose, title, description, children, size = "md", className, showClose = true, stickyHeader, stickyFooter, footer }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const hasHeader = title || description;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8 sm:pt-12">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative flex max-h-[90vh] w-full flex-col rounded-3xl border border-zinc-200/80 bg-white shadow-[0_24px_100px_-36px_rgba(15,23,42,0.45)]",
              sizeClasses[size], className
            )}
          >
            {/* Sticky header */}
            {(hasHeader || showClose) && (
              <div className={cn(
                "flex items-start justify-between gap-4 p-6 pb-4",
                stickyHeader && "sticky top-0 z-10 border-b border-zinc-100 bg-white rounded-t-3xl"
              )}>
                <div className="min-w-0 flex-1">
                  {title && <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {children}
            </div>

            {/* Sticky footer */}
            {footer && (
              <div className={cn(
                "px-6 py-4",
                stickyFooter && "sticky bottom-0 border-t border-zinc-100 bg-white rounded-b-3xl"
              )}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
