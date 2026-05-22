"use client";

import { ShoppingBag, Play } from "lucide-react";

type StoreHeroProps = {
  primaryColor: string;
  secondaryColor: string;
  buttonStyle: string;
  font: string;
  darkMode: boolean;
  storeName: string;
};

export function StoreHero({ primaryColor, secondaryColor, buttonStyle, font, darkMode, storeName }: StoreHeroProps) {
  const isDark = darkMode;
  const bgGradient = isDark
    ? `linear-gradient(135deg, ${secondaryColor} 0%, #000000 100%)`
    : `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}05 100%)`;

  return (
    <section className="relative overflow-hidden" style={{ background: bgGradient, fontFamily: font }}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                Welcome to {storeName}
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: isDark ? "#fafafa" : "#18181b" }}>
              Discover Products{" "}
              <span style={{ color: primaryColor }}>You&apos;ll Love</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed"
              style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              Shop the latest collection of curated products. Premium quality,
              fast shipping, and exceptional customer service.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
                style={{ borderRadius: buttonStyle, backgroundColor: primaryColor }}>
                <ShoppingBag className="h-4 w-4" /> Shop Now
              </a>
              <a href="#"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ borderRadius: buttonStyle, color: primaryColor, border: `1.5px solid ${primaryColor}` }}>
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>10K+</p>
                <p className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>5K+</p>
                <p className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>4.9</p>
                <p className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>Rating</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative z-10 rounded-2xl border bg-white/50 p-4 shadow-2xl backdrop-blur-sm"
              style={{ borderColor: `${primaryColor}20` }}>
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingBag className="mx-auto h-16 w-16" style={{ color: `${primaryColor}40` }} />
                  <p className="mt-4 text-sm font-medium" style={{ color: secondaryColor }}>Featured Collection</p>
                  <p className="text-xs" style={{ color: secondaryColor }}>Summer 2026</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 z-0 h-48 w-48 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: primaryColor }} />
            <div className="absolute -left-4 -top-4 z-0 h-32 w-32 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: primaryColor }} />
          </div>
        </div>
      </div>
    </section>
  );
}
