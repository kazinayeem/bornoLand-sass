"use client";

import Link from "next/link";
import Image from "next/image";
import { SectionWrapper, type SectionData } from "./section-renderer";

const hMap: Record<string, string> = { sm: "h-48 md:h-64", md: "h-64 md:h-80", lg: "h-80 md:h-96" };

export function ImageBanner({ section }: { section: SectionData }) {
  const p = section.props;
  const height = hMap[p.bannerHeight || "md"] || hMap.md;

  return (
    <SectionWrapper section={section}>
      <Link href={p.link || "#"} className={`relative block ${height} overflow-hidden`}>
        {p.imageUrl ? (
          <Image src={p.imageUrl} alt={p.alt || "Banner"} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-300">Banner Image</div>
        )}
        {p.overlay === "true" && <div className="absolute inset-0 bg-black/20" />}
        {p.caption && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-xl bg-black/40 px-6 py-2 text-sm font-semibold text-white backdrop-blur-sm">{p.caption}</span>
          </div>
        )}
      </Link>
    </SectionWrapper>
  );
}
