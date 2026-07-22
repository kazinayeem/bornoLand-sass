"use client";

import { BuilderLink as Link } from "./builder-link";
import Image from "next/image";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { useDevice } from "@/lib/device-context";

const hMap: Record<string, string> = {
  sm: "h-44 sm:h-56 md:h-64",
  md: "h-56 sm:h-72 md:h-80",
  lg: "h-64 sm:h-80 md:h-96",
};

export function ImageBanner({ section }: { section: SectionData }) {
  const p = section.props;
  const device = useDevice();
  const height = hMap[p.bannerHeight || "md"] || hMap.md;
  const imageUrl =
    device === "mobile" && p.mobileImageUrl?.trim() ? p.mobileImageUrl.trim() : p.imageUrl;

  return (
    <SectionWrapper section={section}>
      <Link href={p.link || "#"} className={`relative block w-full overflow-hidden ${height}`}>
        {imageUrl ? (
          <Image src={imageUrl} alt={p.alt || "Banner"} fill className="object-cover" sizes="100vw" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300">Banner Image</div>
        )}
        {p.overlay === "true" && <div className="absolute inset-0 bg-black/20" />}
        {p.caption && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <span className="max-w-full rounded-xl bg-black/40 px-4 py-2 text-center text-xs font-semibold text-white backdrop-blur-sm sm:px-6 sm:text-sm">
              {p.caption}
            </span>
          </div>
        )}
      </Link>
    </SectionWrapper>
  );
}
