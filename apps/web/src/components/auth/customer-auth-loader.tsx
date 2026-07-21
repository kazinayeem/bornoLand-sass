"use client";

import { Loader2 } from "lucide-react";

/** Full-page loader while customer auth is restoring or redirecting. */
export function CustomerAuthLoader({ message = "Checking your account…" }: { message?: string }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-3 px-4 py-16">
      <Loader2 className="h-7 w-7 animate-spin text-apple-ink-muted-48" />
      <p className="text-sm text-apple-ink-muted-48">{message}</p>
    </div>
  );
}
