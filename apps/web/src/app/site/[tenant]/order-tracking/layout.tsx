import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const generateMetadata = createTenantPageMetadata({ pageTitle: "Order Tracking", segment: "order-tracking" });

export default TenantPageLayout;
