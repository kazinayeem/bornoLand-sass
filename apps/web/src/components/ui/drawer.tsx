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

export function Drawer({ open, onClose, title, description, children, side = "right", size = "md", className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={slideFrom}
            animate={slideTo}
            exit={slideFrom}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              `absolute top-0 bottom-0 ${side === "right" ? "right-0" : "left-0"} flex flex-col bg-white shadow-xl border-l border-zinc-200`,
              "w-full", sizeClasses[size]
            )}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div>
                {title && <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>}
                {description && <p className="text-sm text-zinc-500">{description}</p>}
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
