"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";

export function ProductGrid({ section }: { section: SectionData }) {
  const p = section.props;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <StorefrontProductGrid
          title={p.title || "Products"}
          subtitle={p.subtitle || ""}
          productCount={Number(p.productCount) || 12}
          gridColumns={p.desktopColumns || p.gridColumns || "4"}
          tabletColumns={p.tabletColumns || "2"}
          mobileColumns={p.mobileColumns || "1"}
          showFilters={p.showFilters === "true"}
          showSort={p.showSort === "true"}
          showPagination={p.showPagination !== "false"}
          showLoadMore={p.showLoadMore === "true"}
          paginationMode={(p.paginationMode as "pages" | "load-more" | "infinite" | undefined) ?? "pages"}
          allowRowsPerPage={p.allowRowsPerPage === "true"}
        />
      </div>
    </SectionWrapper>
  );
}
