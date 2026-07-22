import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Reports • Super Admin",
  description: "Platform reports and finance overview.",
  canonicalPath: "/admin/dashboard/reports",
});

export default function AdminReportsPage() {
  redirect("/admin/dashboard/platform");
}
