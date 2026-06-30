import type { Metadata } from "next";
import { generateTenantMetadata } from "@/lib/server/page-metadata";

type TenantPageMetadataOptions = {
  pageTitle: string;
  segment?: string;
  description?: string;
};

export function createTenantPageMetadata({ pageTitle, segment = "", description }: TenantPageMetadataOptions) {
  return async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
    const { tenant } = await params;
    const canonicalPath = segment ? `/site/${tenant}/${segment}` : `/site/${tenant}`;
    return generateTenantMetadata({
      tenant,
      pageTitle,
      canonicalPath,
      description,
    });
  };
}

export function TenantPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
