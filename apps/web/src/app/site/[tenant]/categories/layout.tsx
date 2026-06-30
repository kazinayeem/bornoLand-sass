import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const revalidate = 60;
export const generateMetadata = createTenantPageMetadata({ pageTitle: "Categories", segment: "categories" });

export default TenantPageLayout;
