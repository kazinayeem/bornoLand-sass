import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateAdminPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = generateAdminPageMetadata({
  pageTitle: "Features",
  canonicalPath: "/admin/dashboard/features",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
