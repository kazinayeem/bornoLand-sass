"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ADMIN_QUICK_ACTIONS } from "@/lib/admin/admin-nav-config";

export function AdminQuickActions() {
  return (
    <div className="rounded-2xl border border-apple-hairline bg-apple-canvas p-5">
      <h3 className="text-sm font-semibold text-apple-ink">Quick Actions</h3>
      <p className="mt-1 text-xs text-apple-ink-muted-48">Common platform operations</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_QUICK_ACTIONS.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Link
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-apple-hairline bg-apple-canvas-parchment/60 px-3 py-3 text-sm font-medium text-apple-ink transition hover:border-apple-primary/30 hover:bg-apple-canvas-parchment"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-apple-primary/10 text-apple-primary">
                <action.icon className="h-4 w-4" />
              </span>
              <span className="truncate">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
