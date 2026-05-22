"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Palette, Package, ExternalLink, X, Sparkles } from "lucide-react";

type FloatingAdminBarProps = {
  storeId: string;
  primaryColor: string;
};

export function FloatingAdminBar({ storeId, primaryColor }: FloatingAdminBarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => setIsLoggedIn(!!res?.data?.session))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (!isLoggedIn) return null;

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: primaryColor }}>
        <Sparkles className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="fixed bottom-24 right-6 z-50 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
              <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Store Management</p>
              </div>
              <div className="p-2">
                {[
                  { href: `/dashboard/stores/${storeId}`, icon: Settings, label: "Store Dashboard" },
                  { href: `/dashboard/builder/${storeId}`, icon: ExternalLink, label: "Storefront Editor" },
                  { href: `/dashboard/theme`, icon: Palette, label: "Customize Theme" },
                  { href: `/dashboard/products`, icon: Package, label: "Manage Products" }
                ].map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
                    <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
