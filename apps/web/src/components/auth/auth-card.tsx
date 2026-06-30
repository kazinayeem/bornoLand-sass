import type { ReactNode } from "react";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="w-full rounded-3xl border border-zinc-200/80 bg-white/95 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 sm:p-9">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">BornoLand</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">{title}</h1>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
