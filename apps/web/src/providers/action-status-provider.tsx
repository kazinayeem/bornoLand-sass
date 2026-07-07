"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, AlertTriangle, X } from "lucide-react";

type ActionType = "saving" | "creating" | "updating" | "deleting" | "publishing" | "uploading" | "processing" | "generating" | "syncing" | "importing" | "exporting";

type ActionStatus = {
  id: string;
  type: ActionType;
  label: string;
  status: "pending" | "success" | "error";
  message?: string;
  progress?: number;
  startedAt: number;
};

type ActionContextValue = {
  startAction: (type: ActionType, label: string) => string;
  finishAction: (id: string, status: "success" | "error", message?: string) => void;
  updateProgress: (id: string, progress: number) => void;
  activeActions: ActionStatus[];
  isActionRunning: (label?: string) => boolean;
  topProgress: number;
  setTopProgress: (v: number) => void;
  startTopProgress: () => void;
  finishTopProgress: () => void;
};

const ActionContext = createContext<ActionContextValue | null>(null);

export function useActionStatus() {
  const ctx = useContext(ActionContext);
  if (!ctx) throw new Error("useActionStatus must be used within ActionStatusProvider");
  return ctx;
}

const TYPE_LABELS: Record<ActionType, string> = {
  saving: "Saving", creating: "Creating", updating: "Updating", deleting: "Deleting",
  publishing: "Publishing", uploading: "Uploading", processing: "Processing",
  generating: "Generating", syncing: "Syncing", importing: "Importing", exporting: "Exporting",
};

function getActionLabel(type: ActionType, label: string): string {
  return `${TYPE_LABELS[type] || type} ${label}...`;
}

let actionCounter = 0;

export function ActionStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<ActionStatus[]>([]);
  const [topProgress, setTopProgress] = useState(0);
  const topTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const topFinishedRef = useRef(false);

  const startAction = useCallback((type: ActionType, label: string): string => {
    const id = `action-${++actionCounter}`;
    const entry: ActionStatus = {
      id, type, label: getActionLabel(type, label),
      status: "pending", startedAt: Date.now(),
    };
    setStatuses((prev) => [...prev, entry]);
    return id;
  }, []);

  const finishAction = useCallback((id: string, status: "success" | "error", message?: string) => {
    setStatuses((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, message: message || (status === "success" ? "Done" : "Failed") } : a
      )
    );
    setTimeout(() => {
      setStatuses((prev) => prev.filter((a) => a.id !== id));
    }, 4000);
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setStatuses((prev) => prev.map((a) => (a.id === id ? { ...a, progress } : a)));
  }, []);

  const isActionRunning = useCallback(
    (label?: string) => label
      ? statuses.some((a) => a.status === "pending" && a.label.includes(label))
      : statuses.some((a) => a.status === "pending"),
    [statuses]
  );

  const startTopProgress = useCallback(() => {
    setTopProgress(10);
    topFinishedRef.current = false;
    if (topTimerRef.current) clearInterval(topTimerRef.current);
    topTimerRef.current = setInterval(() => {
      setTopProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + (90 - prev) * 0.15;
      });
    }, 200);
  }, []);

  const finishTopProgress = useCallback(() => {
    if (topTimerRef.current) clearInterval(topTimerRef.current);
    setTopProgress(100);
    topFinishedRef.current = true;
    setTimeout(() => {
      setTopProgress(0);
      topFinishedRef.current = false;
    }, 400);
  }, []);

  return (
    <ActionContext.Provider
      value={{
        startAction, finishAction, updateProgress,
        activeActions: statuses,
        isActionRunning,
        topProgress, setTopProgress, startTopProgress, finishTopProgress,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
}

// ── Top Progress Bar ─────────────────────────────────────────────
export function TopProgressBar() {
  const { topProgress } = useActionStatus();

  if (topProgress === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px]">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
        initial={{ width: "0%" }}
        animate={{ width: `${topProgress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ boxShadow: "0 0 8px rgba(59,130,246,0.5)" }}
      />
    </div>
  );
}

// ── Floating Action Status Bar ──────────────────────────────────
export function ActionStatusBar() {
  const { activeActions } = useActionStatus();

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2">
      <AnimatePresence>
        {activeActions.slice(0, 3).map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              action.status === "pending"
                ? "border-zinc-200 bg-white/95"
                : action.status === "success"
                  ? "border-emerald-200 bg-emerald-50/95"
                  : "border-red-200 bg-red-50/95"
            }`}
          >
            {action.status === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : action.status === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <div className="min-w-0 max-w-[200px]">
              <p className={`text-sm font-medium truncate ${
                action.status === "pending" ? "text-zinc-700" : action.status === "success" ? "text-emerald-700" : "text-red-700"
              }`}>
                {action.status === "pending" ? action.label : (action.message || "Done")}
              </p>
              {action.status === "pending" && action.progress != null && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${action.progress}%` }} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Progress Modal ──────────────────────────────────────────────
export function ProgressModal({
  open, onClose, title, progress, label, status,
}: {
  open: boolean;
  onClose?: () => void;
  title: string;
  progress?: number;
  label?: string;
  status: "pending" | "success" | "error";
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => status !== "pending" && onClose?.()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              {status === "pending" ? (
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              ) : status === "success" ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-red-500" />
              )}
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">{title}</h3>
              {label && <p className="mt-1 text-sm text-zinc-500">{label}</p>}
              {status === "pending" && progress != null && (
                <div className="mt-4 w-full">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{Math.round(progress)}%</p>
                </div>
              )}
              {status !== "pending" && onClose && (
                <button onClick={onClose} className="mt-5 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
                  {status === "success" ? "Done" : "Close"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
