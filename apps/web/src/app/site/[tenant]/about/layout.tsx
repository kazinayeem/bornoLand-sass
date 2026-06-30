import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const revalidate = 60;
export const generateMetadata = createTenantPageMetadata({ pageTitle: "About", segment: "about" });

export default TenantPageLayout;
