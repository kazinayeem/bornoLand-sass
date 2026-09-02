"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductEditorForm, VariantDraft } from "@/components/products/product-form";

export type ProductSectionId =
  | "basic"
  | "media"
  | "pricing"
  | "inventory"
  | "variants"
  | "organization"
  | "shipping"
  | "seo"
  | "advanced";

type SectionDef = {
  id: ProductSectionId;
  label: string;
  required?: boolean;
  isComplete: (form: ProductEditorForm, variantDraft: VariantDraft) => boolean;
  hasErrors?: (form: ProductEditorForm) => boolean;
};

export const PRODUCT_SECTIONS: SectionDef[] = [
  {
    id: "basic",
    label: "Basic Information",
    required: true,
    isComplete: (f) => Boolean(f.name.trim()),
    hasErrors: (f) => !f.name.trim(),
  },
  {
    id: "media",
    label: "Media",
    isComplete: (f) => Boolean(f.imageUrl || f.gallery.length > 0),
  },
  {
    id: "pricing",
    label: "Pricing & Cost",
    required: true,
    isComplete: (f, v) =>
      f.productType === "variable"
        ? v.variants.some((vr) => typeof vr.price === "number" && vr.price > 0)
        : Boolean(f.price !== "" && Number(f.price) >= 0),
    hasErrors: (f) => f.productType === "simple" && f.price === "",
  },
  {
    id: "inventory",
    label: "Inventory",
    isComplete: (f) => Boolean(f.sku || Number(f.stock) > 0),
  },
  {
    id: "variants",
    label: "Variants",
    isComplete: (f, v) =>
      f.productType !== "variable" || (v.options.length > 0 && v.variants.length > 0),
  },
  {
    id: "organization",
    label: "Organization",
    isComplete: (f) => Boolean(f.category || f.categoryId || f.brand),
  },
  {
    id: "shipping",
    label: "Shipping",
    isComplete: (f) => Boolean(f.weight),
  },
  {
    id: "seo",
    label: "SEO & Search",
    isComplete: (f) => Boolean(f.seoTitle || f.seoDescription),
  },
  {
    id: "advanced",
    label: "Advanced",
    isComplete: (f) => Boolean(f.internalNotes || f.internalTags),
  },
];

type ProductSectionNavProps = {
  form: ProductEditorForm;
  variantDraft: VariantDraft;
  activeSection: ProductSectionId;
  onSelectSection: (id: ProductSectionId) => void;
};

export function ProductSectionNav({
  form,
  variantDraft,
  activeSection,
  onSelectSection,
}: ProductSectionNavProps) {
  const visibleSections = useMemo(
    () =>
      PRODUCT_SECTIONS.filter(
        (sec) => sec.id !== "variants" || form.productType === "variable"
      ),
    [form.productType]
  );

  return (
    <nav className="sticky top-20 flex flex-col gap-1 rounded-2xl border border-zinc-200/80 bg-white/90 p-2 shadow-xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Form Sections
        </p>
      </div>

      {visibleSections.map((sec) => {
        const isActive = activeSection === sec.id;
        const isCompleted = sec.isComplete(form, variantDraft);

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={cn(
              "group flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all",
              isActive
                ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {isCompleted ? (
                <CheckCircle2
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-emerald-400 dark:text-emerald-600" : "text-emerald-500"
                  )}
                />
              ) : sec.required ? (
                <Circle
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-amber-400" : "text-amber-500"
                  )}
                />
              ) : (
                <Circle
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-zinc-400" : "text-zinc-300 dark:text-zinc-700"
                  )}
                />
              )}
              <span className="truncate">{sec.label}</span>
            </span>

            {sec.required && !isCompleted && (
              <span
                className={cn(
                  "ml-2 text-[10px] font-semibold",
                  isActive ? "text-amber-300" : "text-amber-600"
                )}
              >
                Required
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
