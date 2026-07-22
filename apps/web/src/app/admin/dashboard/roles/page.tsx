import type { Metadata } from "next";
import { UserCog } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Roles & Permissions • Super Admin",
  description: "Manage platform roles and permissions.",
  canonicalPath: "/admin/dashboard/roles",
});

export default function AdminRolesPage() {
  return (
    <AdminPlaceholderPage
      title="Roles & Permissions"
      description="Define platform-wide roles, scopes, and access policies for workspace owners, store admins, and staff."
      icon={UserCog}
      actions={[{ label: "Manage Users", href: "/admin/dashboard/users" }]}
    />
  );
}
