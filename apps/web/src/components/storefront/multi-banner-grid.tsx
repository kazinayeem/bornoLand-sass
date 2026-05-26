"use client";

import Link from "next/link";
import type { StorefrontSectionLike } from "./storefront-types";

const defaultBanners = [
  { image: "New Arrivals", label: "New Arrivals", link: "/shop" },
  { image: "Sale", label: "Sale", link: "/shop" },
  { image: "Trending", label: "Trending", link: "/shop" },
];

export function MultiBannerGrid({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const columns = +(props.columns as string) || 3;
  const gap = +(props.gap as string) || 4;
  const borderRadius = +(props.borderRadius as string) || 12;

  const colClass = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`grid ${colClass}`} style={{ gap: `${gap * 4}px` }}>
          {defaultBanners.map((banner, i) => (
            <Link key={i} href={banner.link}
              className="group relative block overflow-hidden" style={{ borderRadius: `${borderRadius}px` }}>
              <div className="aspect-[3/2]">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 text-2xl font-semibold text-white transition duration-300 group-hover:scale-105">{banner.image}</div>
              </div>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 via-transparent to-transparent p-4 sm:p-6">
                <span className="text-lg font-bold text-white drop-shadow-sm">{banner.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
