"use client";

import { useMemo } from "react";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { SmartImage } from "@/components/ui/smart-image";
import { ArrowRight, ChevronRight, Layers, Award, Sparkles } from "lucide-react";
import type { Category } from "@/redux/api/category-api";
import type { Brand } from "@/redux/api/brand-api";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface StorefrontMegaMenuProps {
  category: Category;
  subcategories: Category[];
  brands?: Array<{
    _id: string;
    name: string;
    nameEn?: string;
    nameBn?: string;
    slug: string;
    logoUrl?: string;
  }>;
  lang?: StoreLanguage;
  onItemClick?: () => void;
  className?: string;
  themeVariant?: "grocery" | "electronics" | "fashion" | "default";
}

export function StorefrontMegaMenu({
  category,
  subcategories,
  brands = [],
  lang = "bn",
  onItemClick,
  className,
  themeVariant = "default",
}: StorefrontMegaMenuProps) {
  const categoryName = getLocalizedName(category, lang);

  // Group subcategories into 2-3 clean columns
  const subcategoryColumns = useMemo(() => {
    const cols: Category[][] = [[], [], []];
    subcategories.forEach((sub, idx) => {
      cols[idx % 3].push(sub);
    });
    return cols.filter((col) => col.length > 0);
  }, [subcategories]);

  const isDark = themeVariant === "electronics";

  return (
    <div
      className={cn(
        "absolute left-0 top-full mt-1 w-full max-w-5xl rounded-2xl p-6 shadow-2xl transition-all border animate-in fade-in-50 zoom-in-95 duration-150 z-50",
        isDark
          ? "bg-[#0c1d2c] text-white border-[#1c354d] shadow-black/60"
          : "bg-white text-zinc-900 border-zinc-200 shadow-zinc-900/15",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ── Left Category Overview / Hero Card ── */}
        <div
          className={cn(
            "md:col-span-3 rounded-xl p-4 flex flex-col justify-between border",
            isDark
              ? "bg-[#081621] border-[#172b3c]"
              : "bg-gradient-to-br from-zinc-50 to-zinc-100/60 border-zinc-200/80"
          )}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  isDark ? "bg-[#0071dc] text-white" : "bg-[#055c3a] text-white"
                )}
              >
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {t("categories", lang)}
              </span>
            </div>

            <h4 className="font-extrabold text-base mb-1.5">{categoryName}</h4>
            {category.description && (
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                {category.description}
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200/40 dark:border-zinc-800">
            <Link
              href={`/category/${category.slug}`}
              onClick={onItemClick}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-bold transition-transform hover:translate-x-1",
                isDark ? "text-[#0071dc]" : "text-[#055c3a]"
              )}
            >
              <span>{t("viewAll", lang)} {categoryName}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Center Subcategory Columns ── */}
        <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subcategoryColumns.length === 0 ? (
            <div className="col-span-3 py-8 text-center text-zinc-400 text-xs">
              <p>{categoryName} {t("allCategories", lang)}</p>
            </div>
          ) : (
            subcategoryColumns.map((col, cIdx) => (
              <div key={cIdx} className="space-y-2">
                {col.map((sub) => {
                  const subName = getLocalizedName(sub, lang);
                  return (
                    <Link
                      key={sub._id}
                      href={`/category/${category.slug}/${sub.slug}`}
                      onClick={onItemClick}
                      className={cn(
                        "group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isDark
                          ? "text-zinc-300 hover:text-white hover:bg-white/5"
                          : "text-zinc-700 hover:text-[#055c3a] hover:bg-zinc-100"
                      )}
                    >
                      <span className="truncate">{subName}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-400" />
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Right Brands & Featured Strip ── */}
        <div
          className={cn(
            "md:col-span-3 border-t md:border-t-0 md:border-l pl-0 md:pl-6 space-y-4",
            isDark ? "border-[#1c354d]" : "border-zinc-100"
          )}
        >
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("popularBrands", lang)}</span>
            </div>

            {brands.length === 0 ? (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-zinc-400">100% Genuine Partner Brands</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {brands.slice(0, 8).map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/brand/${brand.slug}`}
                    onClick={onItemClick}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all hover:scale-105",
                      isDark
                        ? "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:border-[#0071dc]"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400"
                    )}
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className={cn(
              "rounded-xl p-3 text-xs",
              isDark
                ? "bg-[#0071dc]/10 border border-[#0071dc]/30 text-blue-200"
                : "bg-emerald-50 border border-emerald-200 text-emerald-900"
            )}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("pureGuarantee", lang)}</span>
            </div>
            <p className="text-[10px] opacity-80">{t("pureGuaranteeSub", lang)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
