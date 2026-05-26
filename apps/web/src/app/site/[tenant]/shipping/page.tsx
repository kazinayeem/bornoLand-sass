"use client";

import { Truck } from "lucide-react";
import CmsPageView from "@/components/storefront/cms-page-view";

export default function ShippingPage() {
  return (
    <CmsPageView
      slug="shipping-info"
      title="Shipping Information"
      description="Delivery options, times, and costs"
      icon={Truck}
    />
  );
}
