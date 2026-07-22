import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "API Keys • Super Admin",
  description: "Platform API key management.",
  canonicalPath: "/admin/dashboard/api-keys",
});

export default function AdminApiKeysPage() {
  return (
    <AdminPlaceholderPage
      title="API Keys"
      description="Issue and revoke platform API keys for internal services, webhooks, and developer integrations."
      icon={KeyRound}
      actions={[{ label: "Developer Docs", href: "/admin/dashboard/developers" }]}
    />
  );
}
