"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Palette, Package, ShoppingBag, LayoutDashboard, X } from "lucide-react";
import { getStoreUrl } from "@/lib/urls";
import { getAccessToken } from "@/lib/access-token";

type FloatingAdminBarProps = {
  storeSlug: string;
  primaryColor: string;
};

export function FloatingAdminBar({ storeSlug, primaryColor }: FloatingAdminBarProps) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const headers: Record<string, string> = {};
        const token = getAccessToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch("/api/auth/me", { credentials: "include", headers });
        setIsAuthed(res.ok);
      } catch { setIsAuthed(false); }
    };
    check();
  }, []);

  if (!isAuthed) return null;

  const storeUrl = getStoreUrl(storeSlug);

  const links = [
    { icon: LayoutDashboard, label: "Dashboard", href: `/store/${storeSlug}/dashboard` },
    { icon: ShoppingBag, label: "Open Store",   href: storeUrl, external: true },
    { icon: Palette,      label: "Theme",        href: `/store/${storeSlug}/theme` },
    { icon: Package,      label: "Products",     href: `/store/${storeSlug}/products` },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-1 rounded-xl border bg-white p-2 shadow-lg">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink"
                >
                  <link.icon className="h-3.5 w-3.5" /> {link.label}
                  <ExternalLink className="h-3 w-3 text-apple-ink-muted-48" />
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink"
                >
                  <link.icon className="h-3.5 w-3.5" /> {link.label}
                </Link>
              )
            )}
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
