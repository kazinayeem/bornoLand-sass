"use client";
import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderProducts } from "@/lib/use-builder-demo";
import { ProductCard } from "@/components/storefront/product-card";

export function FeaturedProducts({ section }: { section: SectionData }) {
  const { products: realProducts } = useTenant();
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const count = Number(p.productCount) || 6;
  const cols = p.gridColumns || "4";
  const display = products.slice(0, count);
  const showViewAll = p.showViewAll !== "false";

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Featured Products"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        {display.length ? <ColumnGrid columns={cols}>
          {display.map((pr) => <ProductCard key={pr._id} product={pr} />)}
        </ColumnGrid> : <div className="rounded-2xl border border-dashed border-zinc-200 px-5 py-10 text-center text-sm text-apple-ink-muted-48">No products yet. Add products to see them in your storefront preview.</div>}
          {showViewAll && (
          <div className="mt-8 text-center">
            <Link href={p.viewAllLink || "/shop"}
              className="btn-press inline-flex items-center gap-2 rounded-pill border border-apple-hairline bg-apple-canvas px-5 py-2.5 text-sm font-semibold text-apple-ink-muted-80 transition-all hover:bg-apple-canvas-parchment">
              View All →</Link>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
