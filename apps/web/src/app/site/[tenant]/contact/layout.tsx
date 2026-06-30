import { createTenantPageMetadata, TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const revalidate = 60;
export const generateMetadata = createTenantPageMetadata({ pageTitle: "Contact", segment: "contact" });

export default TenantPageLayout;
