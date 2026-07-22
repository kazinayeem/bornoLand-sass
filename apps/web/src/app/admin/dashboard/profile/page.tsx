import type { Metadata } from "next";
import { Users } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Profile • Super Admin",
  description: "Platform admin profile and preferences.",
  canonicalPath: "/admin/dashboard/profile",
});

export default function AdminProfilePage() {
  return (
    <AdminPlaceholderPage
      title="Profile"
      description="Manage your platform administrator profile, notification preferences, and account security."
      icon={Users}
      actions={[
        { label: "Security", href: "/admin/dashboard/security" },
        { label: "Platform Settings", href: "/admin/dashboard/settings" },
      ]}
    />
  );
}
