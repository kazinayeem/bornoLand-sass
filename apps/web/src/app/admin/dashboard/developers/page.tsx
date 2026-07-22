import type { Metadata } from "next";
import { Webhook } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Developers • Super Admin",
  description: "Developer platform tools and documentation.",
  canonicalPath: "/admin/dashboard/developers",
});

export default function AdminDevelopersPage() {
  return (
    <AdminPlaceholderPage
      title="Developers"
      description="Manage developer access, webhook endpoints, SDK versions, and platform API documentation."
      icon={Webhook}
      actions={[{ label: "API Keys", href: "/admin/dashboard/api-keys" }]}
    />
  );
}
