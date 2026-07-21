"use client";

import { ContactMessagesTab } from "@/components/cms/contact-messages-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function CustomerMessagesPage() {
  const { storeId, isLoading } = useStorePage();

  if (isLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <StorePageCard>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-apple-ink">Customer Messages</h1>
        <p className="mt-1 text-caption text-apple-ink-muted-48">Messages submitted through your contact form.</p>
      </div>
      <ContactMessagesTab storeId={storeId} />
    </StorePageCard>
  );
}
