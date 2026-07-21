"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, AlertTriangle, Loader2, X, CheckCircle2, ShieldAlert, Lock,
} from "lucide-react";
import type { Store } from "@/redux/api/store-api";

type DeleteStoreModalProps = {
  store: Store | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (storeId: string) => Promise<void>;
  loading?: boolean;
};

type Phase = "warning" | "confirm" | "progress" | "done";

/* ── Everything this store will lose ─────────────────────── */
const DELETION_ITEMS = [
  "Store",
  "Products",
  "Categories",
  "Inventory",
  "Orders",
  "Customers",
  "Reviews",
  "Coupons",
  "CMS Pages",
  "Builder Pages",
  "Navigation",
  "Theme Settings",
  "Media Library",
  "Uploaded Images",
  "Uploaded Files",
  "SEO Settings",
  "Analytics",
  "Billing History",
  "Activity Logs",
];

/* ── Simulated progress steps ────────────────────────────── */
const PROGRESS_STEPS = [
  "Removing Products",
  "Removing Categories",
  "Removing Media",
  "Removing Builder Data",
  "Removing Pages",
  "Removing Navigation",
  "Removing Theme",
  "Removing Database Records",
  "Cleaning Storage",
];

const LEFT_COL = DELETION_ITEMS.slice(0, 10);
const RIGHT_COL = DELETION_ITEMS.slice(10);

/* ─────────────────────────────────────────────────────────── */
export function DeleteStoreModal({
  store,
  open,
  onClose,
  onConfirm,
  loading,
}: DeleteStoreModalProps) {
  const [phase, setPhase] = useState<Phase>("warning");
  const [typedText, setTypedText] = useState("");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Reset when closed ─────────────────────────────── */
  useEffect(() => {
    if (!open) {
      // Small delay so the exit animation plays
      const t = setTimeout(() => {
        setPhase("warning");
        setTypedText("");
        setCompletedSteps([]);
        if (animationRef.current) clearTimeout(animationRef.current);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ── Auto-focus input on confirm phase ─────────────── */
  useEffect(() => {
    if (open && phase === "confirm") {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, phase]);

  /* ── Animate steps while API call runs ─────────────── */
  const runStepAnimation = useCallback(async (storeId: string) => {
    setPhase("progress");
    setCompletedSteps([]);

    // Stagger step completions visually (total ~2.5s budget for animation)
    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      await new Promise<void>((res) => {
        animationRef.current = setTimeout(() => {
          setCompletedSteps((prev) => [...prev, i]);
          res();
        }, 240 + i * 220);
      });
    }
  }, []);

  const storeName = store?.name ?? "";
  const isMatch = typedText === storeName;

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !loading && phase !== "progress") onClose();
    },
    [loading, onClose, phase]
  );

  const handleProceedToConfirm = () => setPhase("confirm");

  const handleFinalDelete = async () => {
    if (!store || !isMatch) return;

    // Fire animation + API call concurrently
    const [apiResult] = await Promise.allSettled([
      onConfirm(store._id),
      runStepAnimation(store._id),
    ]);

    // Brief "done" state before the parent closes the modal
    setPhase("done");
    await new Promise((r) => setTimeout(r, 900));
    // Parent's onConfirm already handles closing + redirect
  };

  return (
    <AnimatePresence>
      {open && store && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-lg overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas"
          >
            {/* Close button */}
            {phase !== "progress" && phase !== "done" && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {/* ══ PHASE 1: Warning ══════════════════════════════════ */}
              {phase === "warning" && (
                <motion.div
                  key="warning"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <Trash2 className="h-7 w-7 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-apple-ink">Delete Store?</h2>
                      <p className="mt-1 text-sm text-apple-ink-muted-48 leading-relaxed">
                        You are about to permanently delete{" "}
                        <span className="font-semibold text-zinc-800">{storeName}</span>.
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  {/* Deletion list */}
                  <div className="mt-5 rounded-xl border border-red-100 bg-red-50/60 p-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-red-600">
                      This will permanently remove:
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <div className="space-y-1">
                        {LEFT_COL.map((item) => (
                          <div key={item} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-red-400" />
                            <span className="text-xs text-red-700/80">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {RIGHT_COL.map((item) => (
                          <div key={item} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-red-400" />
                            <span className="text-xs text-red-700/80">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Danger banner */}
                  <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                    <p className="text-sm font-semibold text-red-700">
                      This action is irreversible. All data will be permanently erased.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToConfirm}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      I understand, continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ══ PHASE 2: Type confirmation ════════════════════════ */}
              {phase === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <AlertTriangle className="h-7 w-7 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-apple-ink">Confirm Deletion</h2>
                      <p className="mt-1 text-sm text-apple-ink-muted-48">
                        Type the store name to confirm. This is your last chance to cancel.
                      </p>
                    </div>
                  </div>

                  {/* Store summary card */}
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-apple-canvas-parchment px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-apple-ink">{store.name}</p>
                      <p className="text-xs text-apple-ink-muted-48">{store.subdomain || store.slug}</p>
                    </div>
                    <div className="shrink-0 rounded-md bg-red-100 px-2.5 py-1">
                      <span className="text-[11px] font-bold tracking-wider text-red-700">PERMANENT</span>
                    </div>
                  </div>

                  {/* Type field */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium text-apple-ink-muted-80">
                      Type{" "}
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm font-bold text-red-600">
                        {storeName}
                      </code>{" "}
                      to confirm:
                    </label>
                    <div className="relative mt-2">
                      <input
                        ref={inputRef}
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isMatch) handleFinalDelete();
                        }}
                        placeholder={storeName}
                        autoComplete="off"
                        spellCheck={false}
                        className={`h-12 w-full rounded-xl border px-4 text-sm transition-all focus:outline-none focus:ring-2 ${
                          typedText.length > 0 && isMatch
                            ? "border-red-400 bg-red-50/50 text-apple-ink focus:border-red-500 focus:ring-red-500/20"
                            : typedText.length > 0
                            ? "border-zinc-300 bg-white text-apple-ink focus:border-zinc-400 focus:ring-zinc-500/10"
                            : "border-zinc-200 bg-white text-apple-ink placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-zinc-500/10"
                        }`}
                      />
                      {isMatch && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <CheckCircle2 className="h-5 w-5 text-red-500" />
                        </motion.div>
                      )}
                    </div>
                    {typedText.length > 0 && !isMatch && (
                      <p className="mt-1.5 text-xs text-apple-ink-muted-48">
                        Name doesn&apos;t match. Expected:{" "}
                        <span className="font-mono font-semibold text-apple-ink-muted-80">{storeName}</span>
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPhase("warning")}
                      className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                    >
                      ← Back
                    </button>
                    <motion.button
                      type="button"
                      onClick={handleFinalDelete}
                      disabled={!isMatch || loading}
                      whileHover={isMatch ? { scale: 1.02 } : {}}
                      whileTap={isMatch ? { scale: 0.98 } : {}}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                        isMatch && !loading
                          ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25"
                          : "bg-zinc-300 cursor-not-allowed"
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete Forever
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ══ PHASE 3: Progress ═════════════════════════════════ */}
              {phase === "progress" && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  {/* Header row */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      {/* Spinning ring */}
                      <svg className="absolute inset-0 h-full w-full animate-spin" viewBox="0 0 56 56">
                        <circle
                          cx="28" cy="28" r="24"
                          fill="none"
                          stroke="url(#del-ring)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="60 90"
                        />
                        <defs>
                          <linearGradient id="del-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <Trash2 className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-apple-ink">Deleting Store…</h3>
                      <p className="text-sm text-apple-ink-muted-48">
                        Please wait. Do not close this window.
                      </p>
                    </div>
                    {/* Step counter */}
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-apple-ink-muted-48">
                      {Math.min(completedSteps.length + 1, PROGRESS_STEPS.length)}/{PROGRESS_STEPS.length}
                    </span>
                  </div>

                  {/* Overall progress bar */}
                  <div className="mt-5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <motion.div
                        className="h-full rounded-full bg-red-500"
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${Math.round((completedSteps.length / PROGRESS_STEPS.length) * 100)}%`,
                        }}
                        transition={{ ease: "easeOut", duration: 0.3 }}
                      />
                    </div>
                    <p className="mt-1.5 text-right text-[11px] font-medium text-apple-ink-muted-48">
                      {Math.round((completedSteps.length / PROGRESS_STEPS.length) * 100)}% complete
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="mt-3 space-y-1">
                    {PROGRESS_STEPS.map((step, i) => {
                      const done = completedSteps.includes(i);
                      const active = !done && completedSteps.length === i;
                      return (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm transition-all ${
                            done
                              ? "bg-emerald-50/80 text-emerald-700"
                              : active
                              ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                              : "text-apple-ink-muted-48"
                          }`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                            {done ? (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              </motion.span>
                            ) : active ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                            )}
                          </span>
                          <span
                            className={`font-medium leading-none ${
                              done ? "line-through opacity-50" : active ? "font-semibold" : ""
                            }`}
                          >
                            {step}
                          </span>
                          {done && (
                            <span className="ml-auto text-[10px] font-semibold text-emerald-500">Done</span>
                          )}
                          {active && (
                            <span className="ml-auto text-[10px] font-semibold text-red-500">Running…</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Warning note */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-700">
                      Deletion is in progress. Closing this page will not cancel the operation.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ══ PHASE 4: Done ═════════════════════════════════════ */}
              {phase === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-4 p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-apple-ink">Store Deleted</h3>
                    <p className="mt-1 text-sm text-apple-ink-muted-48">
                      <span className="font-semibold">{storeName}</span> has been permanently removed.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
