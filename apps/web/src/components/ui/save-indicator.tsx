"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudOff, CheckCircle2, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

type SaveIndicatorProps = {
  status: SaveStatus;
  lastSaved?: Date | null;
  className?: string;
  compact?: boolean;
  errorMessage?: string;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function SaveIndicator({ status, lastSaved, className, compact, errorMessage }: SaveIndicatorProps) {
  const [showLastSaved, setShowLastSaved] = useState(false);

  useEffect(() => {
    if (status === "saved" && lastSaved) {
      setShowLastSaved(true);
      const timer = setTimeout(() => setShowLastSaved(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [status, lastSaved]);

  const config = {
    saved: {
      icon: CheckCircle2,
      label: "Saved",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    saving: {
      icon: Loader2,
      label: "Saving...",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    unsaved: {
      icon: CloudOff,
      label: "Unsaved",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    error: {
      icon: CloudOff,
      label: errorMessage || "Save failed",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  };

  const c = config[status];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <c.icon className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin", c.color)} />
        <span className={cn("text-xs font-medium", c.color)}>{c.label}</span>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status + (errorMessage || "")}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5",
          c.bg, c.border, className
        )}
      >
        <c.icon className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin", c.color)} />
        <span className={cn("text-xs font-medium", c.color)}>{c.label}</span>
        {(status === "saved" || showLastSaved) && lastSaved && (
          <span className="text-xs text-zinc-400">at {formatTime(lastSaved)}</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Auto-save hook ─────────────────────────────────────────────
export function useAutoSaveIndicator() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const markUnsaved = () => setSaveStatus("saved" === "saved" ? "unsaved" : saveStatus);

  const markSaving = () => setSaveStatus("saving");

  const markSaved = () => {
    setSaveStatus("saved");
    setLastSaved(new Date());
  };

  const markError = (msg?: string) => setSaveStatus("error");

  return {
    saveStatus,
    lastSaved,
    markUnsaved,
    markSaving,
    markSaved,
    markError,
    SaveStatusComponent: (
      <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
    ),
  };
}
