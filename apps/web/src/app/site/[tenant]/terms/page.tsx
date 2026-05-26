"use client";

import { FileText } from "lucide-react";
import CmsPageView from "@/components/storefront/cms-page-view";

export default function TermsPage() {
  return (
    <CmsPageView
      slug="terms-conditions"
      title="Terms of Service"
      description="Store terms and conditions"
      icon={FileText}
    />
  );
}
