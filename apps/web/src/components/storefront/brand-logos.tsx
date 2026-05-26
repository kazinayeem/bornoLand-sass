"use client";

import { useTenant } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "./storefront-types";

const placeholderLogos = [
  "https://placehold.co/160x60/e2e8f0/64748b?text=Brand+A",
  "https://placehold.co/160x60/e2e8f0/64748b?text=Brand+B",
  "https://placehold.co/160x60/e2e8f0/64748b?text=Brand+C",
  "https://placehold.co/160x60/e2e8f0/64748b?text=Brand+D",
  "https://placehold.co/160x60/e2e8f0/64748b?text=Brand+E",
  "https://placehold.co/160x60/e2e8f0/64748b?text=Brand+F",
];

export function BrandLogos({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const title = (props.title as string) || "Trusted By";
  const subtitle = (props.subtitle as string) || "";
  const bg = (props.backgroundColor as string) || "#fafafa";

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {placeholderLogos.map((src, i) => (
            <div key={i} className="h-12 w-32 overflow-hidden rounded-lg opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
              <img src={src} alt={`Brand ${i + 1}`} className="h-full w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
