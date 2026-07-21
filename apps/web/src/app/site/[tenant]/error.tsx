"use client";

import { StorefrontButton } from "@/components/storefront/storefront-ui";

export default function TenantError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-hero-display text-red-200">!</div>
      <h1 className="text-display-md text-apple-ink">Something went wrong</h1>
      <p className="max-w-md text-body text-apple-ink-muted-48">
        An unexpected error occurred. Please try again.
      </p>
      <StorefrontButton variant="utility" onClick={reset}>
        Try Again
      </StorefrontButton>
    </div>
  );
}
