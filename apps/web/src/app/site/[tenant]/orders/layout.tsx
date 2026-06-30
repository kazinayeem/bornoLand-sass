import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const generateMetadata = createTenantPageMetadata({ pageTitle: "Orders", segment: "orders" });

export default TenantPageLayout;
