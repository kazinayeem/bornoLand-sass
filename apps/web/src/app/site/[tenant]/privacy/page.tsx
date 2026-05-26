"use client";

import { Shield } from "lucide-react";
import CmsPageView from "@/components/storefront/cms-page-view";

export default function PrivacyPage() {
  return (
    <CmsPageView
      slug="privacy-policy"
      title="Privacy Policy"
      description="Data collection, usage, and protection"
      icon={Shield}
    />
  );
}
