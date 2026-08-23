"use client";

import { Field, SectionBlock, SelectField, TextField, ToggleField } from "./shared";
import type { SectionEditorProps } from "./types";
import { isSectionPropEnabled } from "@/lib/storefront/product-section-data";

const SOURCE_OPTIONS = [
  { value: "featured", label: "Featured products" },
  { value: "best-sellers", label: "Best sellers" },
  { value: "new-arrivals", label: "New arrivals" },
  { value: "manual", label: "Manual selection" },
  { value: "category", label: "By category" },
];

export function ProductSectionEditor({
  section,
  onPropChange,
  onPropsChange,
}: SectionEditorProps) {
  const p = section.props;
  const source = p.productSource || (
    section.type === "best-sellers" ? "best-sellers"
    : section.type === "new-arrivals" ? "new-arrivals"
    : section.type === "trending-products" ? "featured"
    : "featured"
  );

  return (
    <div>
      <SectionBlock title="Content">
        <Field label="Title">
          <TextField value={p.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="Featured products" />
        </Field>
        <Field label="Subtitle">
          <TextField value={p.subtitle ?? ""} onChange={(v) => onPropChange("subtitle", v)} placeholder="Hand-picked for you" />
        </Field>
      </SectionBlock>

      <SectionBlock title="Products">
        <Field label="Source" hint="Canvas updates instantly from your catalog">
          <SelectField
            value={source}
            onChange={(v) => onPropChange("productSource", v)}
            options={SOURCE_OPTIONS}
          />
        </Field>
        {(source === "category" || p.categorySlug !== undefined) && (
          <Field label="Category slug">
            <TextField value={p.categorySlug ?? ""} onChange={(v) => onPropChange("categorySlug", v)} placeholder="shoes" />
          </Field>
        )}
        {source === "manual" && (
          <Field label="Product IDs" hint="Comma-separated product IDs">
            <TextField value={p.productIds ?? ""} onChange={(v) => onPropChange("productIds", v)} placeholder="id1, id2, id3" />
          </Field>
        )}
        <Field label="Max products">
          <TextField value={p.productCount ?? "8"} onChange={(v) => onPropChange("productCount", v)} placeholder="8" />
        </Field>
        {section.type === "product-grid" && (
          <>
            <Field label="Pagination mode">
              <SelectField
                value={p.paginationMode ?? "pages"}
                onChange={(v) => onPropChange("paginationMode", v)}
                options={[
                  { value: "pages", label: "Page numbers" },
                  { value: "load-more", label: "Load more" },
                  { value: "infinite", label: "Infinite scroll" },
                ]}
              />
            </Field>
            <ToggleField label="Show pagination" value={p.showPagination ?? "true"} onChange={(v) => onPropChange("showPagination", v)} />
            <ToggleField label="Rows per page" value={p.allowRowsPerPage ?? "false"} onChange={(v) => onPropChange("allowRowsPerPage", v)} />
          </>
        )}
        <Field label="Columns">
          <SelectField
            value={p.desktopColumns || p.gridColumns || "4"}
            onChange={(v) => onPropsChange({ ...p, gridColumns: v, desktopColumns: v })}
            options={[
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
            ]}
          />
        </Field>
        {section.type === "product-grid" && (
          <>
            <Field label="Tablet columns">
              <SelectField
                value={p.tabletColumns || "2"}
                onChange={(v) => onPropChange("tabletColumns", v)}
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                ]}
              />
            </Field>
            <Field label="Mobile columns">
              <SelectField
                value={p.mobileColumns || "1"}
                onChange={(v) => onPropChange("mobileColumns", v)}
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                ]}
              />
            </Field>
          </>
        )}
        <ToggleField label="Show badges" value={p.showBadges ?? "true"} onChange={(v) => onPropChange("showBadges", v)} />
        <ToggleField label="Show ratings" value={p.showRatings ?? "true"} onChange={(v) => onPropChange("showRatings", v)} />
        <ToggleField label="Show view now" value={p.showViewNow ?? "false"} onChange={(v) => onPropChange("showViewNow", v)} />
        {isSectionPropEnabled(p.showViewNow, false) && (
          <Field label="View now text">
            <TextField value={p.viewNowText ?? "View Now"} onChange={(v) => onPropChange("viewNowText", v)} placeholder="View Now" />
          </Field>
        )}
        <ToggleField label="Show view all" value={p.showViewAll ?? "true"} onChange={(v) => onPropChange("showViewAll", v)} />
        {isSectionPropEnabled(p.showViewAll, true) && (
          <>
            <Field label="View all text">
              <TextField value={p.viewAllText ?? "View All"} onChange={(v) => onPropChange("viewAllText", v)} placeholder="View All" />
            </Field>
            <Field label="View all link">
              <TextField value={p.viewAllLink ?? "/shop"} onChange={(v) => onPropChange("viewAllLink", v)} placeholder="/shop" />
            </Field>
          </>
        )}
      </SectionBlock>
    </div>
  );
}
