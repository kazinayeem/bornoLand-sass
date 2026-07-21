"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";
import { X } from "lucide-react";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-apple-canvas-parchment dark:bg-apple-surface-black">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar onToggleSidebar={() => setMobileSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-apple-surface-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 border-r border-apple-hairline bg-apple-canvas dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-16 items-center justify-between border-b border-apple-hairline px-4 dark:border-apple-surface-tile-3">
                <span className="text-body-strong text-apple-ink dark:text-apple-body-on-dark">
                  BornoLand
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="btn-press flex h-11 w-11 items-center justify-center rounded-full bg-apple-surface-chip/64 text-apple-ink-muted-48"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
