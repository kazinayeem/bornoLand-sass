"use client";

import { StorefrontStatusPage, StorefrontButton } from "@/components/storefront/storefront-ui";

export default function TenantError({ reset }: { error: Error; reset: () => void }) {
  return (
    <StorefrontStatusPage
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. Please try again."
      action={
        <StorefrontButton variant="utility" onClick={reset}>
          Try Again
        </StorefrontButton>
      }
    />
  );
}
