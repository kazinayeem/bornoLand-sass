"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function AdminPageHeader({
  title,
  description,
  actions,
  badge,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-lg border border-apple-hairline bg-apple-canvas/80 px-5 py-5 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-apple-ink sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {description ? <p className="text-sm leading-6 text-apple-ink-muted-48">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.div>
  );
}
