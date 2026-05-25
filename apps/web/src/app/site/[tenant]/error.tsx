"use client";

export default function TenantError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl font-bold text-red-200">!</div>
      <h1 className="text-2xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="max-w-md text-sm text-zinc-500">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset}
        className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
        Try Again
      </button>
    </div>
  );
}
