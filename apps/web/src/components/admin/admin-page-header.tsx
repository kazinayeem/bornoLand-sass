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
      className="flex flex-col gap-4 rounded-[1.75rem] border border-zinc-200/70 bg-white/80 px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_40px_-30px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {description ? <p className="text-sm leading-6 text-zinc-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.div>
  );
}
