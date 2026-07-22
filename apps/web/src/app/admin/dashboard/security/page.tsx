import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Security • Super Admin",
  description: "Platform security controls.",
  canonicalPath: "/admin/dashboard/security",
});

export default function AdminSecurityPage() {
  return (
    <AdminPlaceholderPage
      title="Security"
      description="Configure platform security policies, session rules, IP allowlists, and compliance controls."
      icon={Shield}
      actions={[{ label: "System Settings", href: "/admin/dashboard/settings" }]}
    />
  );
}
