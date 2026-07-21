"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "max-w-2xl",
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  side = "right",
  size = "md",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const slideFrom = side === "right" ? { x: "100%" } : { x: "-100%" };
  const slideTo = { x: "0%" };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-apple-surface-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={slideFrom}
            animate={slideTo}
            exit={slideFrom}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              `absolute top-0 bottom-0 ${side === "right" ? "right-0 border-l" : "left-0 border-r"} flex w-full flex-col border-apple-hairline bg-apple-canvas dark:bg-apple-surface-tile-2`,
              sizeClasses[size]
            )}
          >
            <div className="flex items-center justify-between border-b border-apple-divider-soft px-lg py-4">
              <div>
                {title && (
                  <h2 className="text-body-strong text-apple-ink dark:text-apple-body-on-dark">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-caption text-apple-ink-muted-48 dark:text-apple-body-muted">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="btn-press flex h-11 w-11 items-center justify-center rounded-full bg-apple-surface-chip/64 text-apple-ink transition-colors hover:bg-apple-surface-chip dark:text-apple-body-on-dark"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className={cn("flex-1 overflow-y-auto px-lg py-4", className)}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
