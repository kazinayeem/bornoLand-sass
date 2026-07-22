import type { Metadata } from "next";
import { Activity } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Activity Logs • Super Admin",
  description: "Platform activity timeline.",
  canonicalPath: "/admin/dashboard/activity",
});

export default function AdminActivityPage() {
  return (
    <AdminPlaceholderPage
      title="Activity Logs"
      description="Real-time feed of platform events including signups, store lifecycle changes, and system operations."
      icon={Activity}
      actions={[{ label: "Audit Logs", href: "/admin/dashboard/audit-center" }]}
    />
  );
}
