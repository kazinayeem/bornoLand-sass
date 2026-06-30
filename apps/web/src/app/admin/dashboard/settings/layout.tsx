import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateAdminPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = generateAdminPageMetadata({
  pageTitle: "Settings",
  canonicalPath: "/admin/dashboard/settings",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
