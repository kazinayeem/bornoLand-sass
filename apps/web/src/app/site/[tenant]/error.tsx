"use client";

import { useEffect, useState } from "react";
import { StorefrontStatusPage, StorefrontButton } from "@/components/storefront/storefront-ui";
import { isChunkLoadError, attemptChunkReload, triggerHardReload } from "@/lib/chunk-error-recovery";

export default function TenantError({ error, reset }: { error: Error; reset: () => void }) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    console.error("[StorefrontError]", error);
    if (isChunkLoadError(error)) {
      setIsChunkError(true);
      attemptChunkReload();
    }
  }, [error]);

  if (isChunkError) {
    return (
      <StorefrontStatusPage
        code="Update"
        title="Storefront Update Available"
        description="A new update was published. Please reload the page to load the latest storefront version."
        action={
          <StorefrontButton variant="utility" onClick={() => triggerHardReload()}>
            Reload Storefront
          </StorefrontButton>
        }
      />
    );
  }

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
