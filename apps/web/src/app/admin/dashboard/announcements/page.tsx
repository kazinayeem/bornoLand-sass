import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Announcements • Super Admin",
  description: "Broadcast platform announcements.",
  canonicalPath: "/admin/dashboard/announcements",
});

export default function AdminAnnouncementsPage() {
  return (
    <AdminPlaceholderPage
      title="Announcements"
      description="Publish maintenance notices, feature launches, and platform-wide broadcasts to all workspaces."
      icon={Megaphone}
    />
  );
}
