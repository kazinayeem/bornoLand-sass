import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const generateMetadata = createTenantPageMetadata({ pageTitle: "Account", segment: "account" });

export default TenantPageLayout;
