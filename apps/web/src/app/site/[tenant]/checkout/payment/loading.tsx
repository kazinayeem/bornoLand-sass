export default function PaymentReturnLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col items-center rounded-2xl border border-zinc-200/80 bg-white p-8 sm:p-10 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
        <div className="mb-6 h-20 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-6 w-36 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-4" />
        <div className="h-8 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-3" />
        <div className="h-4 w-80 rounded bg-zinc-100 dark:bg-zinc-800/60 mb-6" />
        <div className="w-full h-24 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 mb-8" />
        <div className="flex gap-3 w-full justify-center">
          <div className="h-11 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-11 w-40 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}
