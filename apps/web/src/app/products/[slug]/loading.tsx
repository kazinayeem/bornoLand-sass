export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-200" />
      <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="aspect-square animate-pulse rounded-[2rem] bg-zinc-100" />
          <div className="flex gap-3">
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-zinc-100" />
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-zinc-100" />
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-zinc-100" />
          </div>
        </div>
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6">
          <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-100" />
          <div className="mt-4 h-10 w-4/5 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="mt-4 h-6 w-32 animate-pulse rounded-full bg-zinc-100" />
          <div className="mt-6 h-24 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="h-12 animate-pulse rounded-2xl bg-zinc-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}