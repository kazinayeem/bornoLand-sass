"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
};

const variants = {
  danger: {
    bg: "bg-red-600 hover:bg-red-700",
    icon: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    border: "border-red-200 dark:border-red-900/50",
  },
  warning: {
    bg: "bg-amber-600 hover:bg-amber-700",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-900/50",
  },
  default: {
    bg: "bg-apple-primary hover:bg-apple-primary-focus",
    icon: "bg-apple-canvas-parchment text-apple-ink-muted-80 dark:bg-apple-surface-tile-3 dark:text-apple-body-muted",
    border: "border-apple-hairline dark:border-apple-surface-tile-3",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loading) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, loading]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-busy={loading || undefined}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-apple-surface-black/60 backdrop-blur-sm"
            onClick={() => !loading && onClose()}
          />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`relative w-full max-w-md rounded-lg border ${variants[variant].border} bg-apple-canvas p-apple-lg dark:bg-apple-surface-tile-2`}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${variants[variant].icon}`}
            >
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-body-strong text-apple-ink dark:text-apple-body-on-dark">{title}</h3>
            <p className="mt-1 text-caption text-apple-ink-muted-48 dark:text-apple-body-muted">{message}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button
                variant={variant === "danger" ? "danger" : "default"}
                onClick={onConfirm}
                loading={loading}
                loadingKey={variant === "danger" ? "delete" : "save"}
                loadingText={confirmLabel}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
