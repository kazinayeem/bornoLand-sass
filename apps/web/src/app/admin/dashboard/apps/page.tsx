import type { Metadata } from "next";
import { Puzzle } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Apps Marketplace • Super Admin",
  description: "Manage platform apps and integrations.",
  canonicalPath: "/admin/dashboard/apps",
});

export default function AdminAppsPage() {
  return (
    <AdminPlaceholderPage
      title="Apps Marketplace"
      description="Curate third-party integrations, approve app listings, and manage platform app distribution."
      icon={Puzzle}
    />
  );
}
