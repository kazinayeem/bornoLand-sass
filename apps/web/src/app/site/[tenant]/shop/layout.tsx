import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const dynamic = "force-dynamic";
export const generateMetadata = createTenantPageMetadata({ pageTitle: "Shop", segment: "shop" });

export default TenantPageLayout;
