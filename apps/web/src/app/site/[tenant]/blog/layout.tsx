import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const generateMetadata = createTenantPageMetadata({ pageTitle: "Blog", segment: "blog" });

export default TenantPageLayout;
