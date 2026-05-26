"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutTemplate, Palette, Package, ShoppingBag, LayoutDashboard, X } from "lucide-react";
import { getApiUrl } from "@/utils/url";

type FloatingAdminBarProps = {
  storeId: string;
  primaryColor: string;
};

export function FloatingAdminBar({ storeId, primaryColor }: FloatingAdminBarProps) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(getApiUrl("/auth/me"), { credentials: "include" });
        setIsAuthed(res.ok);
      } catch { setIsAuthed(false); }
    };
    check();
  }, []);

  if (!isAuthed) return null;

  const links = [
    { icon: LayoutDashboard, label: "Dashboard", href: `/dashboard` },
    { icon: ShoppingBag, label: "Store", href: `/${storeId}` },
    { icon: LayoutTemplate, label: "Editor", href: `/builder/${storeId}` },
    { icon: Palette, label: "Theme", href: `/dashboard/theme` },
    { icon: Package, label: "Products", href: `/dashboard/products` },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-1 rounded-xl border bg-white p-2 shadow-lg">
            {links.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setExpanded(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
                <link.icon className="h-3.5 w-3.5" /> {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setExpanded(!expanded)}
        className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: primaryColor }}>
        {expanded ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
      </button>
    </div>
  );
}
