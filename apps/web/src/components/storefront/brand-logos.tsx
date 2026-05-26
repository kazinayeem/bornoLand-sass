"use client";

import { useTenant } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "./storefront-types";

const placeholderLogos = [
  "Brand A",
  "Brand B",
  "Brand C",
  "Brand D",
  "Brand E",
  "Brand F",
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
          {placeholderLogos.map((label, i) => (
            <div key={i} className="h-12 w-32 overflow-hidden rounded-lg opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
