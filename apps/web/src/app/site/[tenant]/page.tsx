import { Suspense } from "react";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { HomeStorefrontSkeleton } from "@/components/loading/storefront-skeletons";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { normalizeSectionType } from "@/lib/section-registry";

export const revalidate = 60;

const SHELL_SECTION_TYPES = new Set(["header-bar", "header-logo", "header-nav", "header-icons", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "footer-links", "footer-copyright", "footer-social"]);

async function HomeCanvas({ slug }: { slug: string }) {
  const data = await fetchTenantSite(slug);
  const sections = (data?.page?.sections as Array<{ id: string; type: string; visible?: boolean; props?: Record<string, string | number | boolean | null | undefined> }> | undefined) ?? [];
  // Header and footer belong to StorefrontShell. Rendering them in the page body
  // creates a visible duplicate on the published home page.
  return <StorefrontCanvas sections={sections.filter((section) => !SHELL_SECTION_TYPES.has(normalizeSectionType(section.type)))} />;
}

export default async function TenantSitePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;

  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <HomeStorefrontSkeleton />
        </DelayedSkeleton>
      }
    >
      <HomeCanvas slug={slug} />
    </Suspense>
  );
}
