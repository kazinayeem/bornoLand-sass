"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";
import { isSectionPropEnabled } from "@/lib/storefront/product-section-data";

export function ProductGrid({ section }: { section: SectionData }) {
  const p = section.props;

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <StorefrontProductGrid
          title={p.title || "Products"}
          subtitle={p.subtitle || ""}
          productCount={Number(p.productCount) || 12}
          gridColumns={p.desktopColumns || p.gridColumns || "4"}
          tabletColumns={p.tabletColumns || "2"}
          mobileColumns={p.mobileColumns || "2"}
          showFilters={p.showFilters === "true"}
          showSort={p.showSort === "true"}
          showPagination={p.showPagination !== "false"}
          showLoadMore={p.showLoadMore === "true"}
          paginationMode={(p.paginationMode as "pages" | "load-more" | "infinite" | undefined) ?? "pages"}
          allowRowsPerPage={p.allowRowsPerPage === "true"}
          showBadges={isSectionPropEnabled(p.showBadges, true)}
          showRatings={isSectionPropEnabled(p.showRatings, true)}
          showViewNow={isSectionPropEnabled(p.showViewNow, false)}
          viewNowText={p.viewNowText?.trim() || "View Now"}
          showViewAll={isSectionPropEnabled(p.showViewAll, false)}
          viewAllText={p.viewAllText?.trim() || "View All"}
          viewAllLink={p.viewAllLink || "/shop"}
          productSource={p.productSource}
          categorySlug={p.categorySlug}
          productIds={p.productIds}
          sectionType={section.type}
        />
      </div>
    </SectionWrapper>
  );
}

