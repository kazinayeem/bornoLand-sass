"use client";

import { RefreshCw } from "lucide-react";
import CmsPageView from "@/components/storefront/cms-page-view";

export default function ReturnsPage() {
  return (
    <CmsPageView
      slug="returns"
      title="Returns & Exchanges"
      description="Return policy and exchange information"
      icon={RefreshCw}
    />
  );
}
