"use client";

import { StoreUpcomingPage } from "@/components/store-dashboard/store-upcoming-page";

export default function StoreAppsPage() {
  return (
    <StoreUpcomingPage
      title="Apps"
      description="Install integrations, payment add-ons, and third-party extensions."
      featureKey="apps"
    />
  );
}
