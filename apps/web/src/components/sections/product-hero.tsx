"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function ProductHero({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 md:flex-row">
        <div className="flex-1">
          <div className="aspect-square max-w-sm mx-auto rounded-2xl bg-zinc-100 overflow-hidden">
            {p.productImage ? (
              <img src={p.productImage} alt={p.productName || "Product"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-300">Product</div>
            )}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          {p.badge && <span className="inline-block rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white mb-3">{p.badge}</span>}
          {p.productName && <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: p.textColor || "#18181b" }}>{p.productName}</h1>}
          {p.description && <p className="mt-3 text-sm text-apple-ink-muted-80">{p.description}</p>}
          <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
            {p.productPrice && <span className="text-2xl font-bold text-apple-ink">{p.productPrice}</span>}
            {p.originalPrice && <span className="text-lg text-apple-ink-muted-48 line-through">{p.originalPrice}</span>}
          </div>
          {p.buttonText && (
            <Link href={p.buttonLink || "#"} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800">
              {p.buttonText}
            </Link>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
