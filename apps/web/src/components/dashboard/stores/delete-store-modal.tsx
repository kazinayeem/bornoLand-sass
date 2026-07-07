"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import type { Store } from "@/redux/api/store-api";

type DeleteStoreModalProps = {
  store: Store | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (storeId: string) => Promise<void>;
  loading?: boolean;
};

const STEP_1_ITEMS = [
  "Products", "Categories", "Orders", "Customers", "Reviews",
  "Coupons", "Media Library", "Uploaded Images", "Builder Pages",
  "Builder Sections", "CMS Pages", "Navigation", "Footer", "Theme",
  "Analytics", "Payment History", "Shipping Settings", "Taxes",
  "Domains", "SEO", "Inventory", "Collections", "Product Variants",
  "Wishlist", "Cart Data", "Notifications", "Activity Logs",
  "API Keys", "Store Settings", "Subscription",
  "Custom Domain Mapping", "Everything associated with this store",
];

const ITEMS_PER_COLUMN = 11;

const leftColumn = STEP_1_ITEMS.slice(0, ITEMS_PER_COLUMN);
const rightColumn = STEP_1_ITEMS.slice(ITEMS_PER_COLUMN);

export function DeleteStoreModal({ store, open, onClose, onConfirm, loading }: DeleteStoreModalProps) {
  const [step, setStep] = useState<"confirm" | "verify">("confirm");
  const [typedText, setTypedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setTypedText("");
    }
  }, [open]);

  useEffect(() => {
    if (open && step === "verify" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, step]);

  const storeName = store?.name ?? "";
  const expectedText = `Delete ${storeName}`;
  const isMatch = typedText === expectedText;

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !loading) onClose();
    },
    [loading, onClose]
  );

  const handleFirstConfirm = () => {
    if (!isMatch) return;
    setStep("verify");
    setTypedText("");
  };

  const handleFinalDelete = async () => {
    if (!store) return;
    await onConfirm(store._id);
  };

  return (
    <AnimatePresence>
      {open && store && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_100px_-36px_rgba(15,23,42,0.45)]"
          >
            {!loading && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {step === "confirm" && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                    <Trash2 className="h-7 w-7 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-zinc-900">Delete Store</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      This action is permanent and cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Delete list — two columns */}
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-2.5">
                    Deleting this store will permanently remove:
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      {leftColumn.map((item) => (
                        <p key={item} className="text-xs text-red-600/80 leading-5">
                          • {item}
                        </p>
                      ))}
                    </div>
                    <div>
                      {rightColumn.map((item) => (
                        <p key={item} className="text-xs text-red-600/80 leading-5">
                          • {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <p className="text-sm font-semibold text-red-700">Danger Zone — This action CANNOT be undone.</p>
                  </div>
                </div>

                {/* Type to confirm */}
                <div className="mt-5">
                  <label className="text-sm font-medium text-zinc-700">
                    Type <span className="font-mono font-bold text-red-600">{expectedText}</span> to confirm:
                  </label>
                  <input
                    ref={inputRef}
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isMatch) handleFirstConfirm();
                    }}
                    placeholder={expectedText}
                    className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm placeholder:text-zinc-300 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    autoFocus
                  />
                </div>

                {/* Buttons */}
                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFirstConfirm}
                    disabled={!isMatch || loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Store
                  </button>
                </div>
              </div>
            )}

            {step === "verify" && (
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                    <AlertTriangle className="h-7 w-7 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-zinc-900">Are you absolutely sure?</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Deleting <span className="font-semibold text-zinc-900">{storeName}</span> permanently removes all store data. There is no recovery.
                    </p>
                  </div>
                </div>

                {/* Summary card */}
                <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{store.name}</p>
                      <p className="text-xs text-zinc-500">{store.subdomain || store.slug}</p>
                    </div>
                    <div className="rounded-lg bg-red-100 px-2.5 py-1">
                      <span className="text-xs font-bold text-red-700">PERMANENT</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalDelete}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting Store...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete Forever
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
