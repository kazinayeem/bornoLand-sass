"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <button onClick={reset} className="mt-4 text-primary hover:underline">
        Try again
      </button>
    </div>
  );
}
