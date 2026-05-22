import type { ReactNode } from "react";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="w-full rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.35)] dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">BornoLand</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
