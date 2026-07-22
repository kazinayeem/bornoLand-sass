import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Domains • Super Admin",
  description: "Manage custom domains across the platform.",
  canonicalPath: "/admin/dashboard/domains",
});

export default function AdminDomainsPage() {
  return (
    <AdminPlaceholderPage
      title="Domains"
      description="Review custom domain requests, DNS verification status, and SSL provisioning for all stores."
      icon={Globe}
      actions={[{ label: "View Stores", href: "/admin/dashboard/stores" }]}
    />
  );
}
