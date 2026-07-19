"use client";

import { BuilderLink as Link } from "./builder-link";
import { ImageIcon } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderCategories } from "@/lib/use-builder-demo";

export function CategorySlider({ section }: { section: SectionData }) {
  const { categories: realCategories } = useTenant();
  const categories = useBuilderCategories(realCategories);
  const p = section.props;
  const display = categories;
  if (display.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Categories"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {display.map((cat) => (
            <Link key={cat._id} href={`/category/${cat.slug}`}
              className="group flex w-[160px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <span className="text-xs font-semibold text-zinc-900">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
