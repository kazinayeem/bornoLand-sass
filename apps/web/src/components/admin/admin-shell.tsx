"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";
import { X } from "lucide-react";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_18%),linear-gradient(180deg,#ffffff_0%,#f6f7fb_45%,#eef2ff_100%)]">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar onToggleSidebar={() => setMobileSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 border-r border-zinc-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
                <span className="text-lg font-bold text-zinc-900">BornoLand</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
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
