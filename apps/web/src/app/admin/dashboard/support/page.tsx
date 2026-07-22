import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Support Tickets • Super Admin",
  description: "Platform support ticket queue.",
  canonicalPath: "/admin/dashboard/support",
});

export default function AdminSupportPage() {
  return (
    <AdminPlaceholderPage
      title="Support Tickets"
      description="Monitor and respond to workspace and store support requests across the platform."
      icon={LifeBuoy}
    />
  );
}
