import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Store, ArrowRight, Sparkles, Globe2, ShieldCheck, ShoppingBag } from "lucide-react";
import { getAppOrigin } from "@/lib/urls";

type StoreNotFoundViewProps = {
  tenantSlug?: string;
  customDomain?: string;
};

export function StoreNotFoundView({
  tenantSlug,
  customDomain,
}: StoreNotFoundViewProps) {
  const appOrigin = getAppOrigin();
  const registerUrl = `${appOrigin}/register`;
  const homeUrl = `${appOrigin}/`;

  const identifier = customDomain || (tenantSlug ? `${tenantSlug}.bornoland.com` : "This store");

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white px-4 py-12 text-zinc-900 sm:px-6 lg:px-8">
      {/* Top Header / Brand Logo */}
      <header className="flex w-full max-w-5xl items-center justify-between">
        <Link href={homeUrl} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-zinc-950 p-1.5 shadow-sm">
            <Image
              src="/logo.png"
              alt="BornoLand Logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-base font-extrabold tracking-tight text-zinc-950">
            Borno<span className="text-indigo-600">Land</span>
          </span>
        </Link>

        <Link
          href={registerUrl}
          className="hidden items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 sm:inline-flex"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Start Selling</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="my-auto flex w-full max-w-lg flex-col items-center text-center">
        {/* Subtle Icon Badge */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50/80 shadow-sm">
          <Store className="h-9 w-9 text-zinc-700" />
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-4 ring-white">
            <ShoppingBag className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* English Section */}
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Store not found
        </h1>
        <p className="mt-2 text-base text-zinc-600">
          This store doesn't exist on BornoLand yet.
        </p>

        {/* Domain Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/70 px-3 py-1 font-mono text-xs text-zinc-600">
          <Globe2 className="h-3.5 w-3.5 text-zinc-400" />
          <span>{identifier}</span>
        </div>

        {/* Localized Explanation */}
        <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm text-zinc-600">
          <p className="font-semibold text-zinc-900">Store Not Found</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            No online store has been created on BornoLand with this name yet. Would you like to start your own store with this name?
          </p>
        </div>

        {/* Call to Actions */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={registerUrl}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99]"
          >
            <span>Create Store</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={homeUrl}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 active:scale-[0.99]"
          >
            <span>Go to BornoLand</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 flex flex-col items-center justify-center gap-2 text-xs text-zinc-400 sm:flex-row sm:gap-6">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>BornoLand All-in-One E-Commerce Platform</span>
        </div>
        <span>•</span>
        <Link href={homeUrl} className="hover:text-zinc-600 hover:underline">
          Learn More
        </Link>
        <span>•</span>
        <Link href={`${appOrigin}/contact`} className="hover:text-zinc-600 hover:underline">
          Contact Support
        </Link>
      </footer>
    </div>
  );
}
