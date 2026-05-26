"use client";

import { Ruler } from "lucide-react";
import CmsPageView from "@/components/storefront/cms-page-view";

export default function SizeGuidePage() {
  return (
    <CmsPageView
      slug="size-guide"
      title="Size Guide"
      description="Size measurements and fit information"
      icon={Ruler}
    />
  );
}
