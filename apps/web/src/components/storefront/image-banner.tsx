"use client";

import Link from "next/link";
import type { StorefrontSectionLike } from "./storefront-types";

export function ImageBanner({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const imageUrl = (props.imageUrl as string) || `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 500"><rect width="1400" height="500" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-size="64">Banner</text></svg>')}`;
  const headline = (props.headline as string) || "";
  const subtitle = (props.subtitle as string) || "";
  const buttonText = (props.buttonText as string) || "";
  const buttonLink = (props.buttonLink as string) || "#";
  const opacity = (props.overlayOpacity as string) || "30";
  const textAlign = (props.textAlignment as string) || "center";

  const alignClass = textAlign === "left" ? "items-start text-left" : textAlign === "right" ? "items-end text-right" : "items-center text-center";

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
        <img src={imageUrl} alt={headline || "Banner"} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${+opacity / 100})` }} />
        <div className={`absolute inset-0 flex ${alignClass} justify-center`}>
          <div className="mx-auto max-w-2xl px-6 py-12">
            {headline && <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{headline}</h2>}
            {subtitle && <p className="mt-3 text-base text-white/80 sm:text-lg">{subtitle}</p>}
            {buttonText && (
              <Link href={buttonLink}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:opacity-90">
                {buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
