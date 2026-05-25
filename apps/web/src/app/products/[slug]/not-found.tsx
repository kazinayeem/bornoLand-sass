import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">Product not found</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">We couldn&apos;t find that product.</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-500">The item may have been removed, unpublished, or the link may be outdated.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Back to Shop</Link>
        <Link href="/" className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700">Go Home</Link>
      </div>
    </div>
  );
}