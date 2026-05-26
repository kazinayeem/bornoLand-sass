"use client";

import { HelpCircle } from "lucide-react";
import CmsPageView from "@/components/storefront/cms-page-view";

export default function FaqPage() {
  return (
    <CmsPageView
      slug="faq"
      title="FAQ"
      description="Frequently asked questions"
      icon={HelpCircle}
    />
  );
}
