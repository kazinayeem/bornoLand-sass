"use client";

import { useTenant } from "@/providers/tenant-provider";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";

export function HomeContent() {
  const { pageSections } = useTenant();
  return <StorefrontCanvas sections={pageSections} />;
}
