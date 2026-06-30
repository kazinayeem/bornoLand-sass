"use client";

import { motion } from "framer-motion";

export function MediaGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm"
        >
          <div className="aspect-square animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200/80" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-4/5 animate-pulse rounded-md bg-zinc-100" />
            <div className="h-2.5 w-3/5 animate-pulse rounded-md bg-zinc-50" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-5 w-12 animate-pulse rounded-full bg-zinc-100" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-50" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
