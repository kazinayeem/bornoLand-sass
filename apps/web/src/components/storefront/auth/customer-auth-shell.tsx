"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Sparkles, Lock } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { resolveStoreHref } from "@/lib/store-href";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type CustomerAuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
};

export function CustomerAuthShell({
  children,
  title,
  subtitle,
  badgeText,
}: CustomerAuthShellProps) {
  const { store, theme } = useTenant();
  const pathname = usePathname() || "";
  const storeHomeHref = resolveStoreHref("/", pathname);
  const primaryColor = theme?.primaryColor || "#18181b";

  const storeInitial = (store?.name || "BornoLand").charAt(0).toUpperCase();

  return (
    <div className="relative flex min-h-[calc(100vh-var(--store-header-height,72px))] items-center justify-center px-4 py-8 sm:px-6 md:py-12 lg:py-16">
      {/* Background Decorative subtle gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div
          className="h-[360px] w-[500px] rounded-full opacity-[0.035] blur-3xl"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="absolute top-1/4 -right-10 h-[280px] w-[280px] rounded-full bg-zinc-400 opacity-[0.04] blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-3xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Branded Showcase Panel (Visible on Desktop lg+) */}
          <div className="relative hidden flex-col justify-between border-r border-zinc-100 bg-gradient-to-br from-zinc-50 via-zinc-100/40 to-zinc-50/70 p-8 lg:col-span-5 lg:flex xl:p-10">
            {/* Top: Store Branding */}
            <div>
              <Link
                href={storeHomeHref}
                className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90"
              >
                {store?.logoUrl ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-1 shadow-sm">
                    <Image
                      src={store.logoUrl}
                      alt={store.name || "Store"}
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {storeInitial}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold tracking-tight text-zinc-900 group-hover:text-zinc-700">
                    {store?.name || "BornoLand Store"}
                  </h2>
                  <p className="text-xs text-zinc-500 line-clamp-1">
                    {store?.tagline || "Official Online Store"}
                  </p>
                </div>
              </Link>

              {/* Value Highlights */}
              <div className="mt-10 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-800">
                      100% Safe & Secure
                    </h3>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      Encrypted transactions & verified Bangladesh payment gateways.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-800">
                      Fast Delivery & Tracking
                    </h3>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      Real-time order progress updates from dispatch to your door.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-800">
                      Member Privileges
                    </h3>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      Saved addresses, one-click checkout, and exclusive discounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Trust Note */}
            <div className="mt-8 rounded-xl border border-zinc-200/70 bg-white/70 p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-zinc-600">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[11px] font-medium">Privacy Guaranteed</span>
              </div>
              <p className="mt-1 text-[10px] text-zinc-500 leading-normal">
                Your account is protected with multi-layered encryption. We never share your credentials.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form Panel */}
          <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:col-span-7">
            {/* Mobile Store Header (Visible only on mobile/tablet) */}
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-5 lg:hidden">
              <Link
                href={storeHomeHref}
                className="flex items-center gap-2.5"
              >
                {store?.logoUrl ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-zinc-200/80 bg-white p-0.5">
                    <Image
                      src={store.logoUrl}
                      alt={store.name || "Store"}
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {storeInitial}
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    {store?.name || "BornoLand Store"}
                  </h2>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">
                    {store?.tagline || "Online Store"}
                  </p>
                </div>
              </Link>
            </div>

            {/* Form Title & Subtitle */}
            <div className="mb-6">
              {badgeText ? (
                <span
                  className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-700 bg-zinc-100"
                >
                  {badgeText}
                </span>
              ) : null}
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {title}
              </h1>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {subtitle}
              </p>
            </div>

            {/* Auth Form Children */}
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
