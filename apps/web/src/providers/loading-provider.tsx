"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, AlertTriangle, X, RotateCcw } from "lucide-react";
import {
  ACTION_TOAST_DURATION_MS,
  LOADING_MIN_VISIBLE_MS,
  LOADING_SHOW_DELAY_MS,
} from "@/lib/loading/constants";
import { getActionLabel } from "@/lib/loading/action-labels";
import type { ActionEntry, ActionType } from "@/lib/loading/types";

type LoadingContextValue = {
  // Navigation progress
  navigationProgress: number;
  isNavigating: boolean;
  startNavigation: () => void;
  completeNavigation: () => void;

  // Floating action toasts (CRUD, uploads, etc.)
  actions: ActionEntry[];
  startAction: (type: ActionType, subject: string, retry?: () => void) => string;
  finishAction: (id: string, status: "success" | "error", message?: string) => void;
  updateActionProgress: (id: string, progress: number) => void;
  isActionRunning: (subject?: string) => boolean;

  // Legacy aliases (used by existing code)
  startTopProgress: () => void;
  finishTopProgress: () => void;
  topProgress: number;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

let actionCounter = 0;

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [actions, setActions] = useState<ActionEntry[]>([]);

  const navTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navShowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navStartedAtRef = useRef(0);
  const navActiveRef = useRef(false);

  const startNavigation = useCallback(() => {
    if (navActiveRef.current) return;
    navActiveRef.current = true;
    navStartedAtRef.current = Date.now();

    if (navShowTimerRef.current) clearTimeout(navShowTimerRef.current);
    navShowTimerRef.current = setTimeout(() => {
      setIsNavigating(true);
      setNavigationProgress(12);
      if (navTimerRef.current) clearInterval(navTimerRef.current);
      navTimerRef.current = setInterval(() => {
        setNavigationProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + (90 - prev) * 0.12;
        });
      }, 160);
    }, LOADING_SHOW_DELAY_MS);
  }, []);

  const completeNavigation = useCallback(() => {
    const finish = () => {
      if (navTimerRef.current) clearInterval(navTimerRef.current);
      if (navShowTimerRef.current) clearTimeout(navShowTimerRef.current);
      setNavigationProgress(100);
      setTimeout(() => {
        setNavigationProgress(0);
        setIsNavigating(false);
        navActiveRef.current = false;
      }, 280);
    };

    const elapsed = Date.now() - navStartedAtRef.current;
    const remaining = Math.max(0, LOADING_MIN_VISIBLE_MS - elapsed);
    setTimeout(finish, remaining);
  }, []);

  const startAction = useCallback((type: ActionType, subject: string, retry?: () => void) => {
    const id = `action-${++actionCounter}`;
    const entry: ActionEntry = {
      id,
      type,
      label: getActionLabel(type, subject),
      status: "pending",
      startedAt: Date.now(),
      retry,
    };
    setActions((prev) => [...prev, entry]);
    return id;
  }, []);

  const finishAction = useCallback(
    (id: string, status: "success" | "error", message?: string) => {
      setActions((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
                message:
                  message ?? (status === "success" ? "Done" : "Something went wrong"),
              }
            : a
        )
      );
      setTimeout(() => {
        setActions((prev) => prev.filter((a) => a.id !== id));
      }, ACTION_TOAST_DURATION_MS);
    },
    []
  );

  const updateActionProgress = useCallback((id: string, progress: number) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, progress: Math.min(100, Math.max(0, progress)) } : a))
    );
  }, []);

  const isActionRunning = useCallback(
    (subject?: string) =>
      subject
        ? actions.some((a) => a.status === "pending" && a.label.toLowerCase().includes(subject.toLowerCase()))
        : actions.some((a) => a.status === "pending"),
    [actions]
  );

  const value = useMemo<LoadingContextValue>(
    () => ({
      navigationProgress,
      isNavigating,
      startNavigation,
      completeNavigation,
      actions,
      startAction,
      finishAction,
      updateActionProgress,
      isActionRunning,
      startTopProgress: startNavigation,
      finishTopProgress: completeNavigation,
      topProgress: navigationProgress,
    }),
    [
      navigationProgress,
      isNavigating,
      startNavigation,
      completeNavigation,
      actions,
      startAction,
      finishAction,
      updateActionProgress,
      isActionRunning,
    ]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <ActionToastStack actions={actions} onDismiss={(id) => setActions((p) => p.filter((a) => a.id !== id))} />
    </LoadingContext.Provider>
  );
}

export function useLoadingContext() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoadingContext must be used within LoadingProvider");
  return ctx;
}

// ── Action toast stack ───────────────────────────────────────────

function ActionToastStack({
  actions,
  onDismiss,
}: {
  actions: ActionEntry[];
  onDismiss: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[190] flex flex-col items-end gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence mode="popLayout">
        {actions.slice(0, 4).map((action) => (
          <motion.div
            key={action.id}
            layout
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`pointer-events-auto flex min-w-[220px] max-w-[320px] items-center gap-3 rounded-lg border px-4 py-3 ${
              action.status === "pending"
                ? "border-apple-hairline bg-apple-canvas"
                : action.status === "success"
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                  : "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30"
            }`}
            role="status"
          >
            {action.status === "pending" ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-apple-primary motion-reduce:animate-none" />
            ) : action.status === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-caption ${
                  action.status === "pending"
                    ? "text-apple-ink"
                    : action.status === "success"
                      ? "text-emerald-800 dark:text-emerald-300"
                      : "text-red-800 dark:text-red-300"
                }`}
              >
                {action.status === "pending" ? action.label : action.message}
              </p>
              {action.status === "pending" && action.progress != null && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-apple-canvas-parchment">
                  <div
                    className="h-full rounded-full bg-apple-primary transition-[width] duration-300"
                    style={{ width: `${action.progress}%` }}
                  />
                </div>
              )}
            </div>
            {action.status === "error" && action.retry && (
              <button
                type="button"
                onClick={action.retry}
                className="btn-press shrink-0 rounded-full p-1.5 text-red-600 hover:bg-red-100"
                aria-label="Retry"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            {action.status !== "pending" && (
              <button
                type="button"
                onClick={() => onDismiss(action.id)}
                className="btn-press shrink-0 rounded-full p-1 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Progress modal (uploads, long operations) ────────────────────

export function ProgressModal({
  open,
  onClose,
  title,
  progress,
  label,
  status,
  onRetry,
}: {
  open: boolean;
  onClose?: () => void;
  title: string;
  progress?: number;
  label?: string;
  status: "pending" | "success" | "error";
  onRetry?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const canClose = status !== "pending";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-busy={status === "pending"}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-apple-surface-black/60 backdrop-blur-sm"
            onClick={() => canClose && onClose?.()}
          />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-sm rounded-lg border border-apple-hairline bg-apple-canvas p-apple-lg dark:bg-apple-surface-tile-2"
          >
            <div className="flex flex-col items-center text-center">
              {status === "pending" ? (
                <Loader2 className="h-10 w-10 animate-spin text-apple-primary motion-reduce:animate-none" />
              ) : status === "success" ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-red-500" />
              )}
              <h3 className="mt-4 text-body-strong text-apple-ink">{title}</h3>
              {label && <p className="mt-1 text-caption text-apple-ink-muted-48">{label}</p>}
              {status === "pending" && progress != null && (
                <div className="mt-4 w-full">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-apple-canvas-parchment">
                    <div
                      className="h-full rounded-full bg-apple-primary transition-[width] duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-fine-print text-apple-ink-muted-48">{Math.round(progress)}%</p>
                </div>
              )}
              <div className="mt-5 flex gap-3">
                {status === "error" && onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="btn-press rounded-pill border border-apple-primary px-[22px] py-[11px] text-body text-apple-primary"
                  >
                    Retry
                  </button>
                )}
                {canClose && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-press rounded-pill bg-primary px-[22px] py-[11px] text-body text-primary-foreground"
                  >
                    {status === "success" ? "Done" : "Close"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
