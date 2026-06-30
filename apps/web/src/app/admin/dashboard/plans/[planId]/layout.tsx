import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateAdminPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = generateAdminPageMetadata({
  pageTitle: "Plan Builder",
  canonicalPath: "/admin/dashboard/plans",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
