"use client";

import { useParams } from "next/navigation";
import { CmsPageEditor } from "@/components/cms/cms-page-editor";
import { resolveCmsSlugFromPathSegment } from "@/lib/settings-content-routes";

export default function SettingsContentSlugPage() {
  const params = useParams();
  const segment = typeof params.slug === "string" ? params.slug : "";
  const cmsSlug = resolveCmsSlugFromPathSegment(segment);

  return <CmsPageEditor cmsSlug={cmsSlug} />;
}
